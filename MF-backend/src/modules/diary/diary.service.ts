import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull } from 'typeorm';
import { differenceInDays, format } from 'date-fns';
import { DiaryAccount } from './entities/diary-account.entity';
import { DiaryTransaction } from './entities/diary-transaction.entity';
import { CreateDiaryAccountDto } from './dto/create-diary-account.dto';
import { DiaryDepositDto } from './dto/diary-deposit.dto';
import { DiaryWithdrawDto } from './dto/diary-withdraw.dto';
import { DiaryInterestDto } from './dto/diary-interest.dto';
import { UpdateDiaryTransactionDto } from './dto/update-diary-transaction.dto';
import { DiaryTransactionType } from '../../common/enums/diary-transaction-type.enum';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { Role } from '../../common/enums/role.enum';
import { SequenceType } from '../../common/enums/sequence-type.enum';
import { round2, toNumber } from '../../common/utils/math.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SequencesService } from '../sequences/sequences.service';

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(DiaryAccount)  private readonly accountRepo: Repository<DiaryAccount>,
    @InjectRepository(DiaryTransaction) private readonly txRepo: Repository<DiaryTransaction>,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditLogs: AuditLogsService,
    private readonly sequences: SequencesService,
  ) {}

  async createAccount(centreId: string, userId: string, dto: CreateDiaryAccountDto) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const accountCode = await this.sequences.next(centreId, SequenceType.DIARY, qr);
      const account = qr.manager.create(DiaryAccount, {
        centreId,
        customerId: dto.customerId,
        diaryName: dto.diaryName ?? 'Default',
        accountCode,
        balance: 0,
        isActive: true,
      });
      const saved = await qr.manager.save(DiaryAccount, account);

      // Opening balance → auto DEPOSIT transaction
      if (dto.openingBalance && dto.openingBalance > 0) {
        const amount = round2(toNumber(dto.openingBalance));
        const today  = format(new Date(), 'yyyy-MM-dd');
        const receiptNo = await this.sequences.next(centreId, SequenceType.RECEIPT, qr);
        const tx = qr.manager.create(DiaryTransaction, {
          centreId,
          accountId   : saved.id,
          customerId  : dto.customerId,
          type        : DiaryTransactionType.DEPOSIT,
          amount,
          balanceBefore: 0,
          balanceAfter : amount,
          transactionDate: new Date(today),
          notes       : 'Opening balance',
          performedBy : userId,
          isReversed  : false,
          receiptNo,
        });
        await qr.manager.save(DiaryTransaction, tx);
        // Recalc sets account.balance correctly
        await this.recalcAccount(saved.id, centreId, qr);
      }

      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.CREATE, tableName: 'diary_accounts', recordId: saved.id, newData: saved as any }, qr);
      await qr.commitTransaction();
      // Return fresh account with updated balance
      return qr.manager.findOne(DiaryAccount, { where: { id: saved.id } });
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async findAccounts(centreId: string) {
    return this.accountRepo.find({
      where: { centreId, deletedAt: IsNull() },
      relations: ['customer'],
      select: {
        id: true, centreId: true, customerId: true, diaryName: true, balance: true, accountCode: true,
        cycleStartDate: true, lastWithdrawalDate: true, isActive: true, deletedAt: true,
        createdAt: true, updatedAt: true,
        customer: { id: true, name: true, phone: true, customerCode: true }
      },
      order: { createdAt: 'DESC' }
    });
  }

  async findAccountsByCustomer(centreId: string, customerId: string) {
    return this.accountRepo.find({
      where: { centreId, customerId, deletedAt: IsNull() },
      relations: ['customer'],
      select: {
        id: true, centreId: true, customerId: true, diaryName: true, balance: true, accountCode: true,
        cycleStartDate: true, lastWithdrawalDate: true, isActive: true, deletedAt: true,
        createdAt: true, updatedAt: true,
        customer: { id: true, name: true, phone: true, customerCode: true }
      },
      order: { createdAt: 'DESC' }
    });
  }

  async searchAccounts(centreId: string, search?: string) {
    const qb = this.accountRepo.createQueryBuilder('acc')
      .leftJoinAndSelect('acc.customer', 'customer')
      .select(['acc.id', 'acc.diaryName', 'customer.name'])
      .where('acc.centreId = :centreId', { centreId })
      .andWhere('acc.deletedAt IS NULL');
      
    if (search) {
      qb.andWhere('(acc.diaryName ILIKE :search OR customer.name ILIKE :search)', { search: `%${search}%` });
    }
    
    qb.limit(20);
    const accounts = await qb.getMany();
    
    // Format to return just { id, name } where name is diaryName or customerName
    return accounts.map(acc => ({
      id: acc.id,
      name: acc.diaryName || acc.customer?.name || 'Unnamed Diary'
    }));
  }

  async findAccount(user: { sub: string, role: Role, centreId: string }, id: string): Promise<DiaryAccount> {
    const a = await this.accountRepo.findOne({
      where: { id, centreId: user.centreId, deletedAt: IsNull() },
      relations: ['customer'],
      select: {
        id: true, centreId: true, customerId: true, diaryName: true, balance: true, accountCode: true,
        cycleStartDate: true, lastWithdrawalDate: true, isActive: true, deletedAt: true,
        createdAt: true, updatedAt: true,
        customer: { id: true, name: true, phone: true, customerCode: true }
      }
    });
    if (!a) throw new NotFoundException('Diary account not found');
    if (user.role === Role.CUSTOMER && a.customerId !== user.sub) throw new ForbiddenException();
    return a;
  }

  async updateAccount(
    user: { sub: string, role: Role, centreId: string },
    accountId: string,
    dto: import('./dto/update-diary-account.dto').UpdateDiaryAccountDto,
    ip?: string,
    ua?: string
  ): Promise<DiaryAccount> {
    const a = await this.findAccount(user, accountId);
    const old = { ...a };

    if (dto.diaryName !== undefined) {
      a.diaryName = dto.diaryName;
    }

    await this.accountRepo.save(a);

    await this.auditLogs.log({
      centreId: user.centreId,
      userId: user.sub,
      action: AuditAction.UPDATE,
      tableName: 'diary_accounts',
      recordId: a.id,
      oldData: old as any,
      newData: a as any,
      ipAddress: ip,
      userAgent: ua,
    });

    return a;
  }

  async deleteAccount(
    centreId: string,
    accountId: string,
    userId: string,
    ip?: string,
    ua?: string,
  ): Promise<{ message: string }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const acc = await qr.manager.findOne(DiaryAccount, { where: { id: accountId, centreId, deletedAt: IsNull() } });
      if (!acc) throw new NotFoundException('Diary account not found');

      const old = { ...acc };
      acc.isActive = false;
      acc.deletedAt = new Date();
      await qr.manager.save(DiaryAccount, acc);

      await this.auditLogs.logInTx({
        centreId,
        userId,
        action: AuditAction.DELETE,
        tableName: 'diary_accounts',
        recordId: accountId,
        oldData: old as any,
        newData: acc as any,
        ipAddress: ip,
        userAgent: ua,
      }, qr);

      await qr.commitTransaction();
      return { message: 'Diary account deleted successfully' };
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async deposit(centreId: string, accountId: string, userId: string, dto: DiaryDepositDto, ip?: string, ua?: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const acc = await qr.manager.findOne(DiaryAccount, { where: { id: accountId, centreId } });
      if (!acc) throw new NotFoundException('Diary account not found');
      const amount = round2(toNumber(dto.amount));
      const balanceBefore = round2(toNumber(acc.balance));
      const balanceAfter = round2(balanceBefore + amount);
      acc.balance = balanceAfter;
      await qr.manager.save(DiaryAccount, acc);
      const receiptNo = await this.sequences.next(centreId, SequenceType.RECEIPT, qr);
      const tx = qr.manager.create(DiaryTransaction, {
        centreId, accountId, customerId: acc.customerId,
        type: DiaryTransactionType.DEPOSIT, amount, balanceBefore, balanceAfter,
        transactionDate: new Date(dto.transactionDate), notes: dto.notes ?? null,
        performedBy: userId, isReversed: false, receiptNo,
      });
      const saved = await qr.manager.save(DiaryTransaction, tx);
      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.CREATE, tableName: 'diary_transactions', recordId: saved.id, newData: saved as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.commitTransaction(); return saved;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async withdraw(centreId: string, accountId: string, userId: string, dto: DiaryWithdrawDto, ip?: string, ua?: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const acc = await qr.manager.findOne(DiaryAccount, { where: { id: accountId, centreId } });
      if (!acc) throw new NotFoundException('Diary account not found');
      const amount = round2(toNumber(dto.amount));
      const balanceBefore = round2(toNumber(acc.balance));
      const balanceAfter = round2(balanceBefore - amount);
      acc.balance = balanceAfter;
      acc.lastWithdrawalDate = new Date(dto.transactionDate);
      acc.cycleStartDate = new Date(dto.transactionDate); // reset cycle on withdrawal
      await qr.manager.save(DiaryAccount, acc);
      const receiptNo = await this.sequences.next(centreId, SequenceType.RECEIPT, qr);
      const tx = qr.manager.create(DiaryTransaction, {
        centreId, accountId, customerId: acc.customerId,
        type: DiaryTransactionType.WITHDRAWAL, amount, balanceBefore, balanceAfter,
        transactionDate: new Date(dto.transactionDate), notes: dto.notes ?? null,
        performedBy: userId, isReversed: false, receiptNo,
      });
      const saved = await qr.manager.save(DiaryTransaction, tx);
      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.CREATE, tableName: 'diary_transactions', recordId: saved.id, newData: saved as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.commitTransaction(); return saved;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async addInterest(centreId: string, accountId: string, userId: string, dto: DiaryInterestDto, ip?: string, ua?: string) {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const acc = await qr.manager.findOne(DiaryAccount, { where: { id: accountId, centreId, deletedAt: IsNull() } });
      if (!acc) throw new NotFoundException('Diary account not found');
      if (!acc.cycleStartDate) throw new BadRequestException('No deposit cycle; make a deposit first');
      const days = differenceInDays(new Date(), new Date(acc.cycleStartDate));
      if (days < 365) throw new BadRequestException(`Interest not eligible yet (${days}/365 days)`);
      const amount = round2(toNumber(dto.amount));
      const balanceBefore = round2(toNumber(acc.balance));
      const balanceAfter = round2(balanceBefore + amount);
      acc.balance = balanceAfter;
      await qr.manager.save(DiaryAccount, acc);
      
      const receiptNo = await this.sequences.next(centreId, SequenceType.RECEIPT, qr);
      const tx = qr.manager.create(DiaryTransaction, {
        centreId, accountId, customerId: acc.customerId,
        type: DiaryTransactionType.INTEREST, amount, balanceBefore, balanceAfter,
        transactionDate: new Date(dto.transactionDate), notes: dto.notes ?? null,
        performedBy: userId, isReversed: false, receiptNo,
      });
      const saved = await qr.manager.save(DiaryTransaction, tx);
      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.CREATE, tableName: 'diary_transactions', recordId: saved.id, newData: saved as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.commitTransaction(); return saved;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  async getTransactions(user: { sub: string, role: Role, centreId: string }, accountId: string) {
    await this.findAccount(user, accountId); // enforce access check
    return this.txRepo.find({
      where: { accountId, centreId: user.centreId, isReversed: false },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Returns summary aggregates for diaries in a centre:
   * - today's collection (sum of deposits today)
   * - month's collection (sum of deposits this month)
   * - total diaries (count of diary accounts)
   * - per-agent today's collection (array of { agentId, amount })
   */
  async getSummary(centreId: string, date?: string, from?: string, to?: string) {
    const now = new Date();
    const today = new Date(format(now, 'yyyy-MM-dd'));
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const todays = await this.txRepo.createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount),0)', 'sum')
      .where('tx.centreId = :centreId', { centreId })
      .andWhere('tx.type = :type', { type: DiaryTransactionType.DEPOSIT })
      .andWhere('tx.isReversed = false')
      .andWhere('tx.transactionDate = :today', { today })
      .getRawOne();

    const months = await this.txRepo.createQueryBuilder('tx')
      .select('COALESCE(SUM(tx.amount),0)', 'sum')
      .where('tx.centreId = :centreId', { centreId })
      .andWhere('tx.type = :type', { type: DiaryTransactionType.DEPOSIT })
      .andWhere('tx.isReversed = false')
      .andWhere('tx.transactionDate >= :startMonth', { startMonth })
      .andWhere('tx.transactionDate < :nextMonth', { nextMonth })
      .getRawOne();

    const perAgentRows = await this.txRepo.createQueryBuilder('tx')
      .leftJoin('users', 'u', 'u.id = tx.performedBy')
      .select('tx.performedBy', 'agentId')
      .addSelect('u.name', 'agentName')
      .addSelect('COALESCE(SUM(tx.amount),0)', 'amount')
      .where('tx.centreId = :centreId', { centreId })
      .andWhere('tx.type = :type', { type: DiaryTransactionType.DEPOSIT })
      .andWhere('tx.isReversed = false')
      .andWhere('tx.transactionDate = :today', { today })
      .groupBy('tx.performedBy')
      .addGroupBy('u.name')
      .getRawMany();

    const perAgent = perAgentRows.map((r: any) => ({
      agentId: r.agentId,
      agentName: r.agentName || 'Unknown Agent',
      amount: parseFloat(r.amount),
    }));

    const totalDiaries = await this.accountRepo.count({ where: { centreId, deletedAt: IsNull() } });

    // Date or range-specific aggregates
    let dateDeposits = 0;
    let dateWithdrawals = 0;
    let dateNetChange = 0;

    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      const dRes = await this.txRepo.createQueryBuilder('tx')
        .select('COALESCE(SUM(tx.amount),0)', 'sum')
        .where('tx.centreId = :centreId', { centreId })
        .andWhere('tx.type = :type', { type: DiaryTransactionType.DEPOSIT })
        .andWhere('tx.isReversed = false')
        .andWhere('tx.transactionDate >= :fromDate', { fromDate })
        .andWhere('tx.transactionDate <= :toDate', { toDate })
        .getRawOne();

      const wRes = await this.txRepo.createQueryBuilder('tx')
        .select('COALESCE(SUM(tx.amount),0)', 'sum')
        .where('tx.centreId = :centreId', { centreId })
        .andWhere('tx.isReversed = false')
        .andWhere("(tx.type = :wtype OR tx.type = :ladjust)", { wtype: DiaryTransactionType.WITHDRAWAL, ladjust: DiaryTransactionType.LOAN_ADJUSTMENT })
        .andWhere('tx.transactionDate >= :fromDate', { fromDate })
        .andWhere('tx.transactionDate <= :toDate', { toDate })
        .getRawOne();

      dateDeposits = parseFloat(dRes.sum || '0');
      dateWithdrawals = parseFloat(wRes.sum || '0');
      dateNetChange = round2(dateDeposits - dateWithdrawals);
    } else if (date) {
      const target = new Date(date);
      const dRes = await this.txRepo.createQueryBuilder('tx')
        .select('COALESCE(SUM(tx.amount),0)', 'sum')
        .where('tx.centreId = :centreId', { centreId })
        .andWhere('tx.type = :type', { type: DiaryTransactionType.DEPOSIT })
        .andWhere('tx.isReversed = false')
        .andWhere('tx.transactionDate = :target', { target })
        .getRawOne();

      const wRes = await this.txRepo.createQueryBuilder('tx')
        .select('COALESCE(SUM(tx.amount),0)', 'sum')
        .where('tx.centreId = :centreId', { centreId })
        .andWhere('tx.isReversed = false')
        .andWhere("(tx.type = :wtype OR tx.type = :ladjust)", { wtype: DiaryTransactionType.WITHDRAWAL, ladjust: DiaryTransactionType.LOAN_ADJUSTMENT })
        .andWhere('tx.transactionDate = :target', { target })
        .getRawOne();

      dateDeposits = parseFloat(dRes.sum || '0');
      dateWithdrawals = parseFloat(wRes.sum || '0');
      dateNetChange = round2(dateDeposits - dateWithdrawals);
    }

    return {
      todaysCollection: parseFloat(todays.sum || '0'),
      monthsCollection: parseFloat(months.sum || '0'),
      totalDiaries,
      perAgentToday: perAgent,
      dateDeposits,
      dateWithdrawals,
      dateNetChange,
    };
  }

  // ─── Recalculate all balances for an account ──────────────────────────────
  /**
   * Replays every non-reversed transaction in chronological order to fix
   * balanceBefore / balanceAfter snapshots, then updates account.balance.
   * LOAN_ADJUSTMENT transactions are treated as withdrawals (balance goes down).
   * Must be called inside an active QueryRunner transaction.
   */
  private async recalcAccount(accountId: string, centreId: string, qr: any): Promise<void> {
    const acc = await qr.manager.findOne(DiaryAccount, { where: { id: accountId, centreId } });
    if (!acc) return;

    const txns: DiaryTransaction[] = await qr.manager.find(DiaryTransaction, {
      where: { accountId, centreId, isReversed: false },
      order: { transactionDate: 'ASC', createdAt: 'ASC' },
    });

    let running = 0;
    let lastWithdrawal: Date | null = null;
    let cycleStart: Date | null = null;

    for (const tx of txns) {
      const amt = round2(toNumber(tx.amount));
      tx.balanceBefore = running;

      const isCredit = tx.type === DiaryTransactionType.DEPOSIT || tx.type === DiaryTransactionType.INTEREST;
      running = isCredit ? round2(running + amt) : round2(running - amt);

      tx.balanceAfter = running;
      await qr.manager.save(DiaryTransaction, tx);

      if (tx.type === DiaryTransactionType.DEPOSIT && !cycleStart) {
        cycleStart = new Date(tx.transactionDate);
      }
      if (tx.type === DiaryTransactionType.WITHDRAWAL || tx.type === DiaryTransactionType.LOAN_ADJUSTMENT) {
        lastWithdrawal = new Date(tx.transactionDate);
        cycleStart = new Date(tx.transactionDate); // reset cycle on any withdrawal
      }
    }

    acc.balance = running;
    acc.lastWithdrawalDate = lastWithdrawal;
    acc.cycleStartDate = cycleStart;
    await qr.manager.save(DiaryAccount, acc);
  }

  // ─── Update Transaction ───────────────────────────────────────────────────
  async updateTransaction(
    centreId: string,
    accountId: string,
    txId: string,
    userId: string,
    dto: UpdateDiaryTransactionDto,
    ip?: string,
    ua?: string,
  ): Promise<DiaryTransaction> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const tx = await qr.manager.findOne(DiaryTransaction, { where: { id: txId, accountId, centreId } });
      if (!tx) throw new NotFoundException('Transaction not found');
      if (tx.isReversed) throw new BadRequestException('Cannot edit a reversed transaction');
      if (tx.type === DiaryTransactionType.LOAN_ADJUSTMENT)
        throw new BadRequestException('Loan adjustment transactions cannot be edited here; reverse the loan transaction instead');

      const old = { ...tx };
      if (dto.amount !== undefined)          tx.amount          = round2(toNumber(dto.amount));
      if (dto.transactionDate !== undefined) tx.transactionDate = new Date(dto.transactionDate) as any;
      if (dto.notes !== undefined)           tx.notes           = dto.notes;

      await qr.manager.save(DiaryTransaction, tx);
      await this.recalcAccount(accountId, centreId, qr);

      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.UPDATE, tableName: 'diary_transactions', recordId: txId, oldData: old as any, newData: tx as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.commitTransaction();
      return (await qr.manager.findOne(DiaryTransaction, { where: { id: txId } }))!;
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  // ─── Delete Transaction ───────────────────────────────────────────────────
  async deleteTransaction(
    centreId: string,
    accountId: string,
    txId: string,
    userId: string,
    ip?: string,
    ua?: string,
  ): Promise<{ message: string }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const tx = await qr.manager.findOne(DiaryTransaction, { where: { id: txId, accountId, centreId } });
      if (!tx) throw new NotFoundException('Transaction not found');
      if (tx.isReversed) throw new BadRequestException('Cannot delete a reversed transaction');
      if (tx.type === DiaryTransactionType.LOAN_ADJUSTMENT)
        throw new BadRequestException('Loan adjustment transactions cannot be deleted here; reverse the loan transaction instead');

      await this.auditLogs.logInTx({ centreId, userId, action: AuditAction.DELETE, tableName: 'diary_transactions', recordId: txId, oldData: tx as any, ipAddress: ip, userAgent: ua }, qr);
      await qr.manager.delete(DiaryTransaction, { id: txId });
      await this.recalcAccount(accountId, centreId, qr);

      await qr.commitTransaction();
      return { message: 'Transaction deleted and balances recalculated' };
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }
}
