import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { format } from 'date-fns';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { UdharPerson } from './entities/udhar-person.entity';
import { UdharEntry } from './entities/udhar-entry.entity';
import { CreateUdharPersonDto } from './dto/create-udhar-person.dto';
import { CreateUdharEntryDto } from './dto/create-udhar-entry.dto';
import { UpdateUdharEntryDto } from './dto/update-udhar-entry.dto';
import { UdharEntryType } from '../../common/enums/udhar-entry-type.enum';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { SequenceType } from '../../common/enums/sequence-type.enum';
import { round2, toNumber } from '../../common/utils/math.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SequencesService } from '../sequences/sequences.service';

@Injectable()
export class UdharKhataService {
  constructor(
    @InjectRepository(UdharPerson) private readonly personRepo: Repository<UdharPerson>,
    @InjectRepository(UdharEntry)  private readonly entryRepo: Repository<UdharEntry>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditLogs: AuditLogsService,
    private readonly sequences: SequencesService,
  ) {}

  /** Replay all entries for a person and recalculate balanceAfter + netBalance */
  private async recalcPerson(personId: string, centreId: string, qr: any) {
    const person = await qr.manager.findOne(UdharPerson, { where: { id: personId, centreId } });
    if (!person) return;
    const entries: UdharEntry[] = await qr.manager.find(UdharEntry, {
      where: { personId, centreId },
      order: { entryDate: 'ASC', createdAt: 'ASC' },
    });
    let balance = 0;
    for (const e of entries) {
      // liya = they gave us → our balance goes UP (we owe them less / they owe us more)
      // diya = we gave them → our balance goes DOWN
      const totalAmount = toNumber(e.amount) + toNumber(e.interestAmount || 0);
      balance = e.entryType === UdharEntryType.LIYA
        ? round2(balance + totalAmount)
        : round2(balance - totalAmount);
      e.balanceAfter = balance;
      await qr.manager.save(UdharEntry, e);
    }
    person.netBalance = balance;
    await qr.manager.save(UdharPerson, person);
  }

  async createPerson(centreId: string, userId: string, dto: CreateUdharPersonDto): Promise<UdharPerson> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const personCode = await this.sequences.next(centreId, SequenceType.UDHAR_KHATA, qr);
      const p = qr.manager.create(UdharPerson, {
        centreId, name: dto.name, phone: dto.phone ?? null, personCode, netBalance: 0,
      });
      const saved = await qr.manager.save(UdharPerson, p);

      // Opening balance → auto entry
      if (dto.openingBalance && dto.openingBalance > 0 && dto.openingBalanceType) {
        const today = format(new Date(), 'yyyy-MM-dd');
        const entry = qr.manager.create(UdharEntry, {
          centreId,
          personId    : saved.id,
          entryType   : dto.openingBalanceType,
          amount      : round2(toNumber(dto.openingBalance)),
          balanceAfter: 0, // recalcPerson will fix this
          entryDate   : new Date(today) as any,
          remark      : 'Opening balance',
          createdBy   : userId,
        });
        await qr.manager.save(UdharEntry, entry);
        await this.recalcPerson(saved.id, centreId, qr);
      }

      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.CREATE, tableName: 'udhar_persons', recordId: saved.id, newData: saved as any }, qr);
      await qr.commitTransaction();
      return (await qr.manager.findOne(UdharPerson, { where: { id: saved.id } }))!;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async findPersons(centreId: string): Promise<UdharPerson[]> {
    return this.personRepo.find({ where: { centreId, deletedAt: IsNull() }, order: { name: 'ASC' } });
  }

  async searchPersons(centreId: string, search?: string) {
    const qb = this.personRepo.createQueryBuilder('p')
      .select(['p.id', 'p.name'])
      .where('p.centreId = :centreId', { centreId })
      .andWhere('p.deletedAt IS NULL');
      
    if (search) {
      qb.andWhere('p.name ILIKE :search', { search: `%${search}%` });
    }
    
    qb.limit(20);
    return qb.getMany();
  }

  async findPerson(centreId: string, id: string): Promise<UdharPerson> {
    const p = await this.personRepo.findOne({ where: { id, centreId, deletedAt: IsNull() } });
    if (!p) throw new NotFoundException('Person not found');
    return p;
  }

  async updatePerson(centreId: string, id: string, userId: string, dto: import('./dto/update-udhar-person.dto').UpdateUdharPersonDto, ip?: string, ua?: string): Promise<UdharPerson> {
    const p = await this.findPerson(centreId, id);
    const old = { ...p };
    
    if (dto.name !== undefined) p.name = dto.name;
    if (dto.phone !== undefined) p.phone = dto.phone;
    if (dto.address !== undefined) p.address = dto.address;
    
    await this.personRepo.save(p);
    
    await this.auditLogs.log({
      centreId,
      userId,
      action: AuditAction.UPDATE,
      tableName: 'udhar_persons',
      recordId: p.id,
      oldData: old as any,
      newData: p as any,
      ipAddress: ip,
      userAgent: ua,
    });
    
    return p;
  }

  async addEntry(centreId: string, personId: string, userId: string, dto: CreateUdharEntryDto, ip?: string, ua?: string): Promise<UdharEntry> {
    if (toNumber(dto.amount) <= 0) throw new BadRequestException('amount must be greater than 0');
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const person = await qr.manager.findOne(UdharPerson, { where: { id: personId, centreId } });
      if (!person) throw new NotFoundException('Person not found');
      const entry = qr.manager.create(UdharEntry, {
        centreId, personId,
        entryType: dto.entryType,
        amount: round2(toNumber(dto.amount)),
        interestAmount: dto.interestAmount != null ? round2(toNumber(dto.interestAmount)) : null,
        balanceAfter: 0,
        entryDate: new Date(dto.entryDate) as any,
        dueDate: dto.dueDate ? new Date(dto.dueDate) as any : null,
        remark: dto.remark ?? null,
        createdBy: userId,
      });
      await qr.manager.save(UdharEntry, entry);
      await this.recalcPerson(personId, centreId, qr);
      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.CREATE, tableName: 'udhar_entries', recordId: entry.id, newData: entry as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.commitTransaction();
      return (await qr.manager.findOne(UdharEntry, { where: { id: entry.id } }))!;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async findEntries(centreId: string, personId: string): Promise<UdharEntry[]> {
    return this.entryRepo.find({ where: { personId, centreId }, order: { entryDate: 'ASC', createdAt: 'ASC' } });
  }

  async updateEntry(centreId: string, entryId: string, userId: string, dto: UpdateUdharEntryDto, ip?: string, ua?: string): Promise<UdharEntry> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const entry = await qr.manager.findOne(UdharEntry, { where: { id: entryId, centreId } });
      if (!entry) throw new NotFoundException('Entry not found');
      const old = { ...entry };
      if (dto.entryType !== undefined) entry.entryType = dto.entryType;
      if (dto.amount    !== undefined) entry.amount    = round2(toNumber(dto.amount));
      if (dto.interestAmount !== undefined) entry.interestAmount = dto.interestAmount != null ? round2(toNumber(dto.interestAmount)) : null;
      if (dto.entryDate !== undefined) entry.entryDate = new Date(dto.entryDate) as any;
      if (dto.dueDate   !== undefined) entry.dueDate   = dto.dueDate ? new Date(dto.dueDate) as any : null;
      if (dto.remark    !== undefined) entry.remark    = dto.remark;
      entry.updatedBy = userId;
      await qr.manager.save(UdharEntry, entry);
      await this.recalcPerson(entry.personId, centreId, qr);
      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.UPDATE, tableName: 'udhar_entries', recordId: entryId, oldData: old as any, newData: entry as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.commitTransaction();
      return (await qr.manager.findOne(UdharEntry, { where: { id: entryId } }))!;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async deletePerson(centreId: string, personId: string, userId: string, ip?: string, ua?: string): Promise<void> {
    const person = await this.findPerson(centreId, personId);
    person.deletedAt = new Date();
    await this.personRepo.save(person);
    await this.auditLogs.log({
      centreId, userId, action: AuditAction.DELETE,
      tableName: 'udhar_persons', recordId: personId,
      oldData: person as any, ipAddress: ip, userAgent: ua,
    });
  }

  async deleteEntry(centreId: string, entryId: string, userId: string, ip?: string, ua?: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const entry = await qr.manager.findOne(UdharEntry, { where: { id: entryId, centreId } });
      if (!entry) throw new NotFoundException('Entry not found');
      const personId = entry.personId;
      await qr.manager.delete(UdharEntry, { id: entryId });
      await this.recalcPerson(personId, centreId, qr);
      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.DELETE, tableName: 'udhar_entries', recordId: entryId, oldData: entry as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.commitTransaction();
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }
}
