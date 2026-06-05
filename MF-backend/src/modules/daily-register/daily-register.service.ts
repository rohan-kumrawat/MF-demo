import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DailyRegisterDay } from './entities/daily-register-day.entity';
import { DailyRegisterEntry } from './entities/daily-register-entry.entity';
import { CreateRegisterDayDto } from './dto/create-register-day.dto';
import { CreateRegisterEntryDto } from './dto/create-register-entry.dto';
import { UpdateRegisterEntryDto } from './dto/update-register-entry.dto';
import { round2, toNumber } from '../../common/utils/math.util';

@Injectable()
export class DailyRegisterService {
  constructor(
    @InjectRepository(DailyRegisterDay)   private readonly dayRepo: Repository<DailyRegisterDay>,
    @InjectRepository(DailyRegisterEntry) private readonly entryRepo: Repository<DailyRegisterEntry>,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  /** Compute net movement for a single entry row */
  private entryNet(e: Partial<DailyRegisterEntry>): number {
    return round2(
      toNumber(e.deposit)    + toNumber(e.payIn) +
      toNumber(e.addAmount)  + toNumber(e.recharge) +
      toNumber(e.commission) -
      toNumber(e.withdraw)   - toNumber(e.payOut),
    );
  }

  /** Replay all entries for a day in entryTime order and update balanceAfter + closingBalance */
  private async recalcDay(dayId: string, centreId: string, qr: any) {
    const day = await qr.manager.findOne(DailyRegisterDay, { where: { id: dayId, centreId } });
    if (!day) return;
    const entries: DailyRegisterEntry[] = await qr.manager.find(DailyRegisterEntry, {
      where: { registerDayId: dayId, centreId },
      order: { entryTime: 'ASC' },
    });
    let running = round2(toNumber(day.openingBalance));
    for (const entry of entries) {
      running = round2(running + this.entryNet(entry));
      entry.balanceAfter = running;
      await qr.manager.save(DailyRegisterEntry, entry);
    }
    day.closingBalance = running;
    await qr.manager.save(DailyRegisterDay, day);
  }

  async openDay(centreId: string, userId: string, dto: CreateRegisterDayDto): Promise<DailyRegisterDay> {
    const existing = await this.dayRepo.findOne({ where: { centreId, entryDate: new Date(dto.entryDate) as any } });
    if (existing) throw new ConflictException(`Day ${dto.entryDate} already opened`);

    // Opening balance is explicitly provided by user while opening the day.
    const openingBalance = round2(toNumber(dto.openingBalance));

    const day = this.dayRepo.create({
      centreId, entryDate: new Date(dto.entryDate) as any,
      openingBalance, closingBalance: openingBalance, createdBy: userId,
    });
    return this.dayRepo.save(day);
  }

  async findDays(centreId: string) {
    return this.dayRepo.find({ where: { centreId }, order: { entryDate: 'DESC' } });
  }

  async findDay(centreId: string, dayId: string): Promise<DailyRegisterDay> {
    const d = await this.dayRepo.findOne({ where: { id: dayId, centreId } });
    if (!d) throw new NotFoundException('Register day not found');
    return d;
  }

  async addEntry(centreId: string, dayId: string, userId: string, dto: CreateRegisterEntryDto): Promise<DailyRegisterEntry> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const day = await qr.manager.findOne(DailyRegisterDay, { where: { id: dayId, centreId } });
      if (!day) throw new NotFoundException('Register day not found');

      const entry = qr.manager.create(DailyRegisterEntry, {
        centreId, registerDayId: dayId,
        withdraw  : round2(toNumber(dto.withdraw)),
        deposit   : round2(toNumber(dto.deposit)),
        payIn     : round2(toNumber(dto.payIn)),
        payOut    : round2(toNumber(dto.payOut)),
        recharge  : round2(toNumber(dto.recharge)),
        commission: round2(toNumber(dto.commission)),
        upi       : dto.upi ?? null,
        addAmount : round2(toNumber(dto.addAmount)),
        balanceAfter: 0, // will be set by recalcDay
        remark    : dto.remark ?? null,
        entryTime : dto.entryTime ? new Date(dto.entryTime) : new Date(),
        createdBy : userId,
      });
      await qr.manager.save(DailyRegisterEntry, entry);
      await this.recalcDay(dayId, centreId, qr);
      await qr.commitTransaction();
      return (await qr.manager.findOne(DailyRegisterEntry, { where: { id: entry.id } }))!;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async findEntries(centreId: string, dayId: string): Promise<DailyRegisterEntry[]> {
    return this.entryRepo.find({ where: { registerDayId: dayId, centreId }, order: { entryTime: 'ASC' } });
  }

  async updateEntry(centreId: string, entryId: string, userId: string, dto: UpdateRegisterEntryDto): Promise<DailyRegisterEntry> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const entry = await qr.manager.findOne(DailyRegisterEntry, { where: { id: entryId, centreId } });
      if (!entry) throw new NotFoundException('Entry not found');
      if (dto.withdraw   !== undefined) entry.withdraw    = round2(toNumber(dto.withdraw));
      if (dto.deposit    !== undefined) entry.deposit     = round2(toNumber(dto.deposit));
      if (dto.payIn      !== undefined) entry.payIn       = round2(toNumber(dto.payIn));
      if (dto.payOut     !== undefined) entry.payOut      = round2(toNumber(dto.payOut));
      if (dto.recharge   !== undefined) entry.recharge    = round2(toNumber(dto.recharge));
      if (dto.commission !== undefined) entry.commission  = round2(toNumber(dto.commission));
      if (dto.upi        !== undefined) entry.upi         = dto.upi;
      if (dto.addAmount  !== undefined) entry.addAmount   = round2(toNumber(dto.addAmount));
      if (dto.remark     !== undefined) entry.remark      = dto.remark;
      if (dto.entryTime  !== undefined) entry.entryTime   = new Date(dto.entryTime);
      entry.updatedBy = userId;
      await qr.manager.save(DailyRegisterEntry, entry);
      await this.recalcDay(entry.registerDayId, centreId, qr);
      await qr.commitTransaction();
      return (await qr.manager.findOne(DailyRegisterEntry, { where: { id: entryId } }))!;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async deleteEntry(centreId: string, entryId: string): Promise<void> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const entry = await qr.manager.findOne(DailyRegisterEntry, { where: { id: entryId, centreId } });
      if (!entry) throw new NotFoundException('Entry not found');
      const dayId = entry.registerDayId;
      await qr.manager.delete(DailyRegisterEntry, { id: entryId });
      await this.recalcDay(dayId, centreId, qr);
      await qr.commitTransaction();
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }
}
