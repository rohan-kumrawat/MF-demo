import {
  Injectable, NotFoundException, BadRequestException, ForbiddenException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository, IsNull, In } from 'typeorm';
import { differenceInDays, differenceInCalendarMonths, isAfter, addMonths, addDays, format, parse, parseISO, isValid } from 'date-fns';
import { Loan } from './entities/loan.entity';
import { LoanTransaction } from './entities/loan-transaction.entity';
import { CreateLoanDto } from './dto/create-loan.dto';
import { CreateLoanTransactionDto } from './dto/create-loan-transaction.dto';
import { PreCloseLoanDto } from './dto/pre-close-loan.dto';
import { ReverseLoanTransactionDto } from './dto/reverse-loan-transaction.dto';
import { UpdateLoanTransactionDto } from './dto/update-loan-transaction.dto';
import { RenewBulletLoanDto } from './dto/renew-bullet-loan.dto';
import { UpdateLoanDto } from './dto/update-loan.dto';
import { ApplyBulletPenaltyDto } from './dto/apply-bullet-penalty.dto';
import { LoanStatus } from '../../common/enums/loan-status.enum';
import { LoanType } from '../../common/enums/loan-type.enum';
import { LoanTransactionType } from '../../common/enums/loan-transaction-type.enum';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { SequenceType } from '../../common/enums/sequence-type.enum';
import { DiaryTransactionType } from '../../common/enums/diary-transaction-type.enum';
import { round2, toNumber } from '../../common/utils/math.util';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { SequencesService } from '../sequences/sequences.service';
import { Role } from '../../common/enums/role.enum';
import { DiaryAccount } from '../diary/entities/diary-account.entity';
import { DiaryTransaction } from '../diary/entities/diary-transaction.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
    @InjectRepository(LoanTransaction)
    private readonly txRepo: Repository<LoanTransaction>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly auditLogs: AuditLogsService,
    private readonly sequences: SequencesService,
  ) {}

  private normalizeDateParam(value?: string): string | undefined {
    if (!value) return undefined;

    const trimmed = value.trim();
    const candidates = [
      parseISO(trimmed),
      parse(trimmed, 'yyyy-MM-dd', new Date()),
      parse(trimmed, 'dd/MM/yyyy', new Date()),
    ];

    const validDate = candidates.find((candidate) => isValid(candidate));
    if (!validDate) return undefined;

    return format(validDate, 'yyyy-MM-dd');
  }

  private async attachLoanPeople<T extends { customerId: string; agentId?: string | null; status: LoanStatus }>(centreId: string, loan: T) {
    const [customer, agent] = await Promise.all([
      this.userRepo.findOne({
        where: { id: loan.customerId, centreId },
        select: { id: true, name: true, phone: true, customerCode: true },
      }),
      loan.agentId
        ? this.userRepo.findOne({
          where: { id: loan.agentId, centreId },
          select: { id: true, name: true },
        })
        : Promise.resolve(null),
    ]);

    return {
      ...loan,
      customer: customer ? {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        customerCode: customer.customerCode,
      } : null,
      agent: agent ? {
        id: agent.id,
        name: agent.name,
      } : null,
      isActive: (loan as any).status === LoanStatus.ACTIVE,
    };
  }

  private async attachLoanPeopleMany<T extends { customerId: string; agentId?: string | null; status: LoanStatus }>(centreId: string, loans: T[]) {
    const customerIds = [...new Set(loans.map(loan => loan.customerId))];
    const agentIds = [...new Set(loans.map(loan => loan.agentId).filter((id): id is string => Boolean(id)))];

    const [customers, agents] = await Promise.all([
      customerIds.length > 0
        ? this.userRepo.find({
          where: { centreId, id: In(customerIds) },
          select: { id: true, name: true, phone: true, customerCode: true },
        })
        : Promise.resolve([]),
      agentIds.length > 0
        ? this.userRepo.find({
          where: { centreId, id: In(agentIds) },
          select: { id: true, name: true },
        })
        : Promise.resolve([]),
    ]);

    const customerMap = new Map(customers.map(customer => [customer.id, customer]));
    const agentMap = new Map(agents.map(agent => [agent.id, agent]));

    return loans.map(loan => {
      const customer = customerMap.get(loan.customerId) ?? null;
      const agent = loan.agentId ? agentMap.get(loan.agentId) ?? null : null;

      return {
        ...loan,
        customer: customer ? {
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          customerCode: customer.customerCode,
        } : null,
        agent: agent ? {
          id: agent.id,
          name: agent.name,
        } : null,
        isActive: loan.status === LoanStatus.ACTIVE,
      };
    });
  }

  // ─── Auto-Split Helper ────────────────────────────────────────────────────
  /**
   * Computes principalPart / interestPart / penaltyPart automatically.
   *
   * EMI (flat rate):
   *   monthlyInterest = (principal × rate/100) / 12
   *   interestPart    = min(amount, monthlyInterest)
   *   principalPart   = amount - interestPart
   *
   * PENALTY: penaltyPart = amount (entire amount is penalty)
   * OTHER:   principalPart = amount (entire amount reduces principal)
   */
  private computeSplit(
    loan: Loan,
    amount: number,
    type: LoanTransactionType,
  ): { principalPart: number; interestPart: number; penaltyPart: number } {
    if (type === LoanTransactionType.PENALTY) {
      return { principalPart: 0, interestPart: 0, penaltyPart: round2(amount) };
    }
    if (type === LoanTransactionType.OTHER) {
      return { principalPart: round2(amount), interestPart: 0, penaltyPart: 0 };
    }

    // EMI / FULL_PAYMENT — flat rate split
    if (loan.loanType === LoanType.EMI && loan.interestRate && loan.tenureMonths) {
      const monthlyInterest = round2(
        (toNumber(loan.principalAmount) * toNumber(loan.interestRate) / 100) / 12,
      );
      if (type === LoanTransactionType.FULL_PAYMENT) {
        // Remaining EMIs determine remaining interest
        const emisPaid         = loan.emiAmount ? Math.floor(toNumber(loan.totalPaid) / toNumber(loan.emiAmount)) : 0;
        const emisRemaining    = Math.max(0, (loan.tenureMonths ?? 0) - emisPaid);
        const remainingInterest = round2(emisRemaining * monthlyInterest);
        const interestPart     = round2(Math.min(amount, remainingInterest));
        const principalPart    = round2(amount - interestPart);
        return { principalPart, interestPart, penaltyPart: 0 };
      }
      // Regular EMI split
      const interestPart  = round2(Math.min(amount, monthlyInterest));
      const principalPart = round2(amount - interestPart);
      return { principalPart, interestPart, penaltyPart: 0 };
    }

    // Bullet / Flexible — entire amount is principal, EXCEPT for RENEWALS which are 100% interest
    if (type === LoanTransactionType.RENEWAL) {
      return { principalPart: 0, interestPart: round2(amount), penaltyPart: 0 };
    }
    return { principalPart: round2(amount), interestPart: 0, penaltyPart: 0 };
  }

  // ─── EMI Stats Helper ────────────────────────────────────────────────────
  /**
   * Returns computed EMI progress fields for any loan.
   * These are NEVER stored — always computed live from loan data.
   */
  private computeEmiStats(loan: Loan) {
    if (loan.loanType === LoanType.BULLET) {
      return {
        nextEmiDueDate: loan.endDate ? (typeof loan.endDate === 'string' ? loan.endDate : format(loan.endDate as Date, 'yyyy-MM-dd')) : null,
      };
    }
    if (loan.loanType === LoanType.WEEKLY) {
      if (!loan.weeklyInstallment || !loan.totalWeeks) {
        return {};
      }
      const totalEmis = loan.totalWeeks;
      const weeksPaid = Math.min(
        totalEmis,
        Math.floor(differenceInDays(new Date(), new Date(loan.startDate)) / 7),
      );
      const emisRemaining = Math.max(0, totalEmis - weeksPaid);
      const nextEmiDueDate = emisRemaining > 0
        ? format(addDays(new Date(loan.startDate), (weeksPaid + 1) * 7), 'yyyy-MM-dd')
        : null;
      return {
        totalEmis,
        emisPaid: weeksPaid,
        emisRemaining,
        nextEmiDueDate,
      };
    }
    if (loan.loanType !== LoanType.EMI || !loan.emiAmount || !loan.tenureMonths) {
      return {}; // not applicable for flexible
    }
    const totalEmis      = loan.tenureMonths;
    const emisPaid       = Math.min(totalEmis, Math.floor(toNumber(loan.totalPaid) / toNumber(loan.emiAmount)));
    const emisRemaining  = Math.max(0, totalEmis - emisPaid);
    const nextEmiDueDate = emisRemaining > 0
      ? format(addMonths(new Date(loan.startDate), emisPaid + 1), 'yyyy-MM-dd')
      : null;
    return { totalEmis, emisPaid, emisRemaining, nextEmiDueDate };
  }

  async create(
    centreId: string,
    userId: string,
    dto: CreateLoanDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Loan> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const loanAccountNumber = await this.sequences.next(centreId, SequenceType.LOAN, qr);
      const fileCharge     = round2(toNumber(dto.fileCharge));
      const otherCharge    = round2(toNumber(dto.otherCharge));
      const disbursedAmount = round2(toNumber(dto.principalAmount) - fileCharge - otherCharge);

      // Auto-compute endDate for EMI/BULLET/WEEKLY loans from startDate + tenure
      const startDate = new Date(dto.startDate);
      let endDate: Date | null = null;
      if ((dto.loanType === LoanType.EMI || dto.loanType === LoanType.BULLET) && dto.tenureMonths) {
        endDate = addMonths(startDate, dto.tenureMonths);
      } else if (dto.loanType === LoanType.FLEXIBLE && dto.totalDays) {
        endDate = addDays(startDate, dto.totalDays);
      } else if (dto.loanType === LoanType.WEEKLY && dto.totalWeeks) {
        endDate = addDays(startDate, dto.totalWeeks * 7);
      } else if (dto.endDate) {
        endDate = new Date(dto.endDate); // bullet loan fallback: provided by frontend
      }

      const loan = qr.manager.create(Loan, {
        loanAccountNumber,
        centreId,
        customerId       : dto.customerId,
        agentId          : dto.agentId ?? null,
        loanType         : dto.loanType,
        principalAmount  : round2(toNumber(dto.principalAmount)),
        interestRate     : round2(toNumber(dto.interestRate)),
        tenureMonths     : dto.tenureMonths ?? null,
        fileCharge,
        otherCharge,
        disbursedAmount,             // auto-computed: principal - fileCharge - otherCharge
        purposeOfLoan    : dto.purposeOfLoan ?? null,
        emiPaymentMode   : dto.emiPaymentMode ?? null,
        guarantors       : dto.guarantors ?? null,
        familyMembers    : dto.familyMembers ?? null,
        fatherOrHusbandName: dto.fatherOrHusbandName ?? null,
        aadharNumber     : dto.aadharNumber ?? null,
        accountNumber    : dto.accountNumber ?? null,
        memberSince      : dto.memberSince ? new Date(dto.memberSince) : null,
        hasPreviousLoan  : dto.hasPreviousLoan ?? false,
        previousLoanAmount: dto.previousLoanAmount ?? null,
        previousLoanStatus: dto.previousLoanStatus ?? null,
        totalPayable     : round2(toNumber(dto.totalPayable)),
        dailyInstallment : dto.dailyInstallment ? round2(toNumber(dto.dailyInstallment)) : null,
        totalDays        : dto.totalDays ?? null,
        weeklyInstallment: dto.weeklyInstallment ? round2(toNumber(dto.weeklyInstallment)) : null,
        totalWeeks       : dto.totalWeeks ?? null,
        emiAmount        : dto.emiAmount ? round2(toNumber(dto.emiAmount)) : null,
        startDate,
        endDate,
        totalPaid        : 0,
        remainingBalance : round2(toNumber(dto.totalPayable)),
        status           : LoanStatus.ACTIVE,
        notes            : dto.notes ?? null,
      });

      const saved = await qr.manager.save(Loan, loan);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.CREATE, tableName: 'loans', recordId: saved.id, newData: saved as any, ipAddress, userAgent },
        qr,
      );

      await qr.commitTransaction();
      return this.attachLoanPeople(centreId, saved);
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  async updateLoan(
    centreId: string,
    loanId: string,
    userId: string,
    dto: UpdateLoanDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Loan> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.status !== LoanStatus.ACTIVE) {
        throw new BadRequestException(`Cannot edit a ${loan.status} loan.`);
      }

      // Simple fields
      if (dto.agentId !== undefined) loan.agentId = dto.agentId ?? null;
      if (dto.purposeOfLoan !== undefined) loan.purposeOfLoan = dto.purposeOfLoan ?? null;
      if (dto.emiPaymentMode !== undefined) loan.emiPaymentMode = dto.emiPaymentMode ?? null;
      if (dto.guarantors !== undefined) loan.guarantors = (dto.guarantors as any) ?? null;
      if (dto.familyMembers !== undefined) loan.familyMembers = (dto.familyMembers as any) ?? null;
      if (dto.fatherOrHusbandName !== undefined) loan.fatherOrHusbandName = dto.fatherOrHusbandName ?? null;
      if (dto.aadharNumber !== undefined) loan.aadharNumber = dto.aadharNumber ?? null;
      if (dto.accountNumber !== undefined) loan.accountNumber = dto.accountNumber ?? null;
      if (dto.memberSince !== undefined) loan.memberSince = dto.memberSince ? new Date(dto.memberSince) : null;
      if (dto.hasPreviousLoan !== undefined) loan.hasPreviousLoan = dto.hasPreviousLoan;
      if (dto.previousLoanAmount !== undefined) loan.previousLoanAmount = dto.previousLoanAmount ?? null;
      if (dto.previousLoanStatus !== undefined) loan.previousLoanStatus = dto.previousLoanStatus ?? null;
      if (dto.notes !== undefined) loan.notes = dto.notes ?? null;

      // Numerical core fields
      if (dto.principalAmount !== undefined) loan.principalAmount = round2(toNumber(dto.principalAmount));
      if (dto.interestRate !== undefined) loan.interestRate = round2(toNumber(dto.interestRate));
      if (dto.fileCharge !== undefined) loan.fileCharge = round2(toNumber(dto.fileCharge));
      if (dto.otherCharge !== undefined) loan.otherCharge = round2(toNumber(dto.otherCharge));

      // Recalculate disbursedAmount
      loan.disbursedAmount = round2(
        toNumber(loan.principalAmount) - toNumber(loan.fileCharge) - toNumber(loan.otherCharge)
      );

      // Date fields
      if (dto.startDate !== undefined) loan.startDate = new Date(dto.startDate);

      // Tenure
      if (dto.tenureMonths !== undefined) loan.tenureMonths = dto.tenureMonths ?? null;
      if (dto.totalDays !== undefined) loan.totalDays = dto.totalDays ?? null;
      if (dto.totalWeeks !== undefined) loan.totalWeeks = dto.totalWeeks ?? null;

      // Auto-compute endDate
      let endDate: Date | null = loan.endDate;
      if ((loan.loanType === LoanType.EMI || loan.loanType === LoanType.BULLET) && loan.tenureMonths) {
        endDate = addMonths(loan.startDate, loan.tenureMonths);
      } else if (loan.loanType === LoanType.FLEXIBLE && loan.totalDays) {
        endDate = addDays(loan.startDate, loan.totalDays);
      } else if (loan.loanType === LoanType.WEEKLY && loan.totalWeeks) {
        endDate = addDays(loan.startDate, loan.totalWeeks * 7);
      } else if (dto.endDate !== undefined) {
        endDate = dto.endDate ? new Date(dto.endDate) : null;
      }
      loan.endDate = endDate;

      // Installments
      if (dto.emiAmount !== undefined) loan.emiAmount = dto.emiAmount ? round2(toNumber(dto.emiAmount)) : null;
      if (dto.dailyInstallment !== undefined) loan.dailyInstallment = dto.dailyInstallment ? round2(toNumber(dto.dailyInstallment)) : null;
      if (dto.weeklyInstallment !== undefined) loan.weeklyInstallment = dto.weeklyInstallment ? round2(toNumber(dto.weeklyInstallment)) : null;

      // Total Payable & Remaining Balance
      if (dto.totalPayable !== undefined) {
        const newTotalPayable = round2(toNumber(dto.totalPayable));
        const totalPaid = round2(toNumber(loan.totalPaid));
        const newRemaining = round2(newTotalPayable - totalPaid);

        if (newRemaining < 0) {
          throw new BadRequestException(`Cannot reduce total payable to ₹${newTotalPayable} because customer has already paid ₹${totalPaid}.`);
        }

        loan.totalPayable = newTotalPayable;
        loan.remainingBalance = newRemaining;
      }

      const saved = await qr.manager.save(Loan, loan);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.UPDATE, tableName: 'loans', recordId: saved.id, newData: saved as any, ipAddress, userAgent },
        qr,
      );

      await qr.commitTransaction();
      return this.attachLoanPeople(centreId, saved);
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ─── Find Loans (with filters) ────────────────────────────────────────────
  async findAll(
    centreId: string,
    user: { sub: string; role: Role },
    filters: {
      status?    : LoanStatus;
      from?      : string;
      to?        : string;
      search?    : string;
      customerId?: string;
      agentId?   : string;
      overdue?   : boolean;
    } = {},
  ) {
    const normalizedFrom = this.normalizeDateParam(filters.from);
    const normalizedTo = this.normalizeDateParam(filters.to);

    const qb = this.loanRepo.createQueryBuilder('loan')
      .where('loan.centreId = :centreId', { centreId })
      .andWhere('loan.deletedAt IS NULL')
      .orderBy('loan.createdAt', 'DESC');

    // Role-based isolation
    if (user.role === Role.AGENT)    qb.andWhere('loan.agentId = :uid',    { uid: user.sub });
    if (user.role === Role.CUSTOMER) qb.andWhere('loan.customerId = :uid', { uid: user.sub });

    // Admin filters
    if (filters.status)     qb.andWhere('loan.status = :status',         { status: filters.status });
    if (filters.customerId) qb.andWhere('loan.customerId = :cid',        { cid: filters.customerId });
    if (filters.agentId)    qb.andWhere('loan.agentId = :aid',           { aid: filters.agentId });
    if (normalizedFrom)     qb.andWhere('loan.startDate >= :from',       { from: normalizedFrom });
    if (normalizedTo)       qb.andWhere('loan.startDate <= :to',         { to: normalizedTo });
    if (filters.search) {
      qb.andWhere('loan.loanAccountNumber ILIKE :s', { s: `%${filters.search}%` });
    }

    const loans = await qb.getMany();
    const loansWithPeople = await this.attachLoanPeopleMany(centreId, loans);
    const enriched = loansWithPeople.map(loan => ({
      ...loan,
      overdue: this.computeOverdue(loan),
      ...this.computeEmiStats(loan),
    }));

    // Filter overdue after enrichment (computed field)
    if (filters.overdue) return enriched.filter(l => l.overdue > 0);
    return enriched;
  }

  async findOne(centreId: string, id: string, user: { sub: string; role: Role }) {
    const loan = await this.loanRepo.findOne({ where: { id, centreId, deletedAt: IsNull() } });
    if (!loan) throw new NotFoundException('Loan not found');

    if (user.role === Role.CUSTOMER && loan.customerId !== user.sub)
      throw new ForbiddenException('Access denied');
    if (user.role === Role.AGENT && loan.agentId !== user.sub)
      throw new ForbiddenException('Access denied');

    return this.attachLoanPeople(centreId, {
      ...loan,
      overdue : this.computeOverdue(loan),
      ...this.computeEmiStats(loan),
    });
  }

  // ─── Compute Overdue (on-the-fly, never stored) ───────────────────────────
  computeOverdue(loan: Loan): number {
    const today = new Date();
    const totalPaid = toNumber(loan.totalPaid);

    if (loan.loanType === LoanType.EMI) {
      // Mn-3: Use calendar-accurate month diff instead of dividing days by 30
      const monthsPassed = differenceInCalendarMonths(today, new Date(loan.startDate));
      const expected     = round2(toNumber(loan.emiAmount) * monthsPassed);
      return Math.max(0, round2(expected - totalPaid));
    }

    if (loan.loanType === LoanType.BULLET) {
      return loan.endDate && isAfter(today, new Date(loan.endDate))
        ? round2(toNumber(loan.remainingBalance))
        : 0;
    }

    if (loan.loanType === LoanType.WEEKLY) {
      const weeksPassed = Math.max(0, Math.floor(differenceInDays(today, new Date(loan.startDate)) / 7));
      const cappedWeeks = Math.min(weeksPassed, loan.totalWeeks ?? 0);
      const expected = round2(toNumber(loan.weeklyInstallment) * cappedWeeks);
      return Math.max(0, round2(expected - totalPaid));
    }

    // FLEXIBLE — per-day instalment
    const daysPassed = differenceInDays(today, new Date(loan.startDate));
    const cappedDays = Math.min(daysPassed, loan.totalDays ?? 0);
    const expected   = round2(toNumber(loan.dailyInstallment) * cappedDays);
    return Math.max(0, round2(expected - totalPaid));
  }

  // ─── Repayment Schedule ───────────────────────────────────────────────────
  async getSchedule(centreId: string, loanId: string, user: { sub: string; role: Role }) {
    const loan = await this.loanRepo.findOne({ where: { id: loanId, centreId, deletedAt: IsNull() } });
    if (!loan) throw new NotFoundException('Loan not found');
    if (user.role === Role.CUSTOMER && loan.customerId !== user.sub) throw new ForbiddenException();
    if (user.role === Role.AGENT    && loan.agentId    !== user.sub) throw new ForbiddenException();

    const txns = await this.txRepo.find({
      where: { loanId, centreId, isReversed: false },
      order: { paymentDate: 'ASC' },
    });

    if (loan.loanType === LoanType.EMI)      return this.buildEmiSchedule(loan, txns);
    if (loan.loanType === LoanType.BULLET)   return this.buildBulletSchedule(loan, txns);
    if (loan.loanType === LoanType.WEEKLY)   return this.buildWeeklySchedule(loan, txns);
    return this.buildFlexibleSchedule(loan, txns);
  }

  private buildEmiSchedule(loan: Loan, txns: LoanTransaction[]) {
    const tenure         = loan.tenureMonths ?? 0;
    const emiAmount      = toNumber(loan.emiAmount);
    const monthlyInterest = round2((toNumber(loan.principalAmount) * toNumber(loan.interestRate) / 100) / 12);
    const today          = new Date();

    // Only EMI/FULL_PAYMENT transactions count toward schedule slots
    const emiTxns = txns.filter(t =>
      t.type === LoanTransactionType.EMI || t.type === LoanTransactionType.FULL_PAYMENT,
    );

    let currentTxIndex = 0;
    let remainingTxAmount = emiTxns.length > 0 ? toNumber(emiTxns[0].amount) : 0;

    return Array.from({ length: tenure }, (_, i) => {
      const emiNumber = i + 1;
      const dueDate   = addMonths(new Date(loan.startDate), emiNumber);
      
      let paidAmountForSlot = 0;
      let slotReceipt = null;
      let slotPaidDate = null;
      let needed = emiAmount;

      while (needed > 0 && currentTxIndex < emiTxns.length) {
        if (remainingTxAmount > 0) {
          slotReceipt = emiTxns[currentTxIndex].receiptNo;
          slotPaidDate = emiTxns[currentTxIndex].paymentDate;
        }

        if (remainingTxAmount >= needed) {
          paidAmountForSlot += needed;
          remainingTxAmount = round2(remainingTxAmount - needed);
          needed = 0;
        } else {
          paidAmountForSlot += remainingTxAmount;
          needed = round2(needed - remainingTxAmount);
          remainingTxAmount = 0;
          currentTxIndex++;
          if (currentTxIndex < emiTxns.length) {
            remainingTxAmount = toNumber(emiTxns[currentTxIndex].amount);
          }
        }
      }

      let status: 'paid' | 'partial' | 'pending' | 'overdue';
      if (paidAmountForSlot >= emiAmount) {
        status = 'paid';
      } else if (paidAmountForSlot > 0) {
        status = 'partial';
      } else if (dueDate < today) {
        status = 'overdue';
      } else {
        status = 'pending';
      }

      return {
        emiNumber,
        dueDate       : format(dueDate, 'yyyy-MM-dd'),
        expectedAmount: emiAmount,
        breakup       : { principal: round2(emiAmount - monthlyInterest), interest: monthlyInterest },
        status,
        paidAmount    : round2(paidAmountForSlot),
        paidDate      : slotPaidDate,
        receiptNo     : slotReceipt,
      };
    });
  }

  private buildBulletSchedule(loan: Loan, txns: LoanTransaction[]) {
    const today    = new Date();
    const totalPaid = round2(txns.reduce((s, t) => s + toNumber(t.amount), 0));
    const endDate  = loan.endDate ? new Date(loan.endDate) : null;

    let status: string;
    if (loan.status === LoanStatus.CLOSED || loan.status === LoanStatus.PRE_CLOSED) {
      status = 'paid';
    } else if (endDate && isAfter(today, endDate)) {
      status = 'overdue';
    } else {
      status = 'pending';
    }

    return [{
      installmentNumber: 1,
      dueDate          : loan.endDate ? (typeof loan.endDate === 'string' ? loan.endDate : format(loan.endDate as Date, 'yyyy-MM-dd')) : null,
      expectedAmount   : toNumber(loan.totalPayable),
      breakup          : {
        principal: toNumber(loan.principalAmount),
        interest : round2(toNumber(loan.totalPayable) - toNumber(loan.principalAmount)),
      },
      status,
      totalPaid,
      remainingBalance : toNumber(loan.remainingBalance),
      transactionCount : txns.length,
    }];
  }

  private buildFlexibleSchedule(loan: Loan, txns: LoanTransaction[]) {
    const totalDays       = loan.totalDays ?? 0;
    const dailyInstalment = toNumber(loan.dailyInstallment);
    const today           = new Date();

    if (!dailyInstalment || !totalDays) {
      return { note: 'Flexible loan — no fixed daily schedule', transactions: txns };
    }

    const scheduleTxns = txns.filter(t => t.type !== LoanTransactionType.PENALTY);
    let currentTxIndex = 0;
    let remainingTxAmount = scheduleTxns.length > 0 ? toNumber(scheduleTxns[0].amount) : 0;

    return Array.from({ length: totalDays }, (_, i) => {
      const dayNumber = i + 1;
      const dueDate   = new Date(loan.startDate);
      dueDate.setDate(dueDate.getDate() + dayNumber);
      
      let paidAmountForSlot = 0;
      let slotReceipt = null;
      let needed = dailyInstalment;

      while (needed > 0 && currentTxIndex < scheduleTxns.length) {
        if (remainingTxAmount > 0) {
          slotReceipt = scheduleTxns[currentTxIndex].receiptNo;
        }

        if (remainingTxAmount >= needed) {
          paidAmountForSlot += needed;
          remainingTxAmount = round2(remainingTxAmount - needed);
          needed = 0;
        } else {
          paidAmountForSlot += remainingTxAmount;
          needed = round2(needed - remainingTxAmount);
          remainingTxAmount = 0;
          currentTxIndex++;
          if (currentTxIndex < scheduleTxns.length) {
            remainingTxAmount = toNumber(scheduleTxns[currentTxIndex].amount);
          }
        }
      }

      let status: string;
      if (paidAmountForSlot >= dailyInstalment) {
        status = 'paid';
      } else if (paidAmountForSlot > 0) {
        status = 'partial';
      } else if (dueDate < today) {
        status = 'overdue';
      } else {
        status = 'pending';
      }

      return {
        dayNumber,
        dueDate      : format(dueDate, 'yyyy-MM-dd'),
        expectedAmount: dailyInstalment,
        status,
        paidAmount: round2(paidAmountForSlot),
        receiptNo : slotReceipt,
      };
    });
  }

  private buildWeeklySchedule(loan: Loan, txns: LoanTransaction[]) {
    const totalWeeks    = loan.totalWeeks ?? 0;
    const weeklyAmount  = toNumber(loan.weeklyInstallment);
    const today         = new Date();

    if (!weeklyAmount || !totalWeeks) {
      return { note: 'Weekly loan — no fixed weekly schedule', transactions: txns };
    }

    const scheduleTxns = txns.filter(t => t.type !== LoanTransactionType.PENALTY);
    let currentTxIndex = 0;
    let remainingTxAmount = scheduleTxns.length > 0 ? toNumber(scheduleTxns[0].amount) : 0;

    return Array.from({ length: totalWeeks }, (_, i) => {
      const installmentNumber = i + 1;
      const dueDate = addDays(new Date(loan.startDate), installmentNumber * 7);
      
      let paidAmountForSlot = 0;
      let slotReceipt = null;
      let needed = weeklyAmount;

      while (needed > 0 && currentTxIndex < scheduleTxns.length) {
        if (remainingTxAmount > 0) {
          slotReceipt = scheduleTxns[currentTxIndex].receiptNo;
        }

        if (remainingTxAmount >= needed) {
          paidAmountForSlot += needed;
          remainingTxAmount = round2(remainingTxAmount - needed);
          needed = 0;
        } else {
          paidAmountForSlot += remainingTxAmount;
          needed = round2(needed - remainingTxAmount);
          remainingTxAmount = 0;
          currentTxIndex++;
          if (currentTxIndex < scheduleTxns.length) {
            remainingTxAmount = toNumber(scheduleTxns[currentTxIndex].amount);
          }
        }
      }

      let status: string;
      if (paidAmountForSlot >= weeklyAmount) {
        status = 'paid';
      } else if (paidAmountForSlot > 0) {
        status = 'partial';
      } else if (dueDate < today) {
        status = 'overdue';
      } else {
        status = 'pending';
      }

      return {
        installmentNumber,
        dueDate       : format(dueDate, 'yyyy-MM-dd'),
        expectedAmount: weeklyAmount,
        status,
        paidAmount: round2(paidAmountForSlot),
        receiptNo : slotReceipt,
      };
    });
  }

  // ─── Centre Dashboard ─────────────────────────────────────────────────────
  async getDashboard(centreId: string) {
    const todayDate = new Date();
    const today      = format(todayDate, 'yyyy-MM-dd');
    const monthStart = format(new Date(todayDate.getFullYear(), todayDate.getMonth(), 1), 'yyyy-MM-dd');

    const [loans, todayTxns, monthTxns, todayDiaryTxns, monthDiaryTxns] = await Promise.all([
      this.loanRepo.find({ where: { centreId, deletedAt: IsNull() } }),
      this.txRepo.createQueryBuilder('tx')
        .where('tx.centreId = :centreId', { centreId })
        .andWhere('tx.paymentDate = :today', { today })
        .andWhere('tx.isReversed = false')
        .getMany(),
      this.txRepo.createQueryBuilder('tx')
        .where('tx.centreId = :centreId', { centreId })
        .andWhere('tx.paymentDate >= :start', { start: monthStart })
        .andWhere('tx.isReversed = false')
        .getMany(),
      this.dataSource.getRepository(DiaryTransaction).createQueryBuilder('dt')
        .where('dt.centreId = :centreId', { centreId })
        .andWhere('dt.transactionDate = :today', { today })
        .andWhere('dt.isReversed = false')
        .andWhere('dt.type = :type', { type: DiaryTransactionType.DEPOSIT })
        .getMany(),
      this.dataSource.getRepository(DiaryTransaction).createQueryBuilder('dt')
        .where('dt.centreId = :centreId', { centreId })
        .andWhere('dt.transactionDate >= :start', { start: monthStart })
        .andWhere('dt.isReversed = false')
        .andWhere('dt.type = :type', { type: DiaryTransactionType.DEPOSIT })
        .getMany(),
    ]);

    const activeLoans  = loans.filter(l => l.status === LoanStatus.ACTIVE);
    const overdueLoans = activeLoans.filter(l => this.computeOverdue(l) > 0);

    return {
      totalLoans         : loans.length,
      activeLoans        : activeLoans.length,
      closedLoans        : loans.filter(l => l.status === LoanStatus.CLOSED).length,
      preClosedLoans     : loans.filter(l => l.status === LoanStatus.PRE_CLOSED).length,
      overdueLoans       : overdueLoans.length,
      totalDisbursed     : round2(loans.reduce((s, l) => s + toNumber(l.disbursedAmount), 0)),
      totalOutstanding   : round2(activeLoans.reduce((s, l) => s + toNumber(l.remainingBalance), 0)),
      totalOverdueAmount : round2(overdueLoans.reduce((s, l) => s + this.computeOverdue(l), 0)),
      collectedToday     : round2(
        todayTxns.reduce((s, t) => s + toNumber(t.amount), 0) +
        todayDiaryTxns.reduce((s, t) => s + toNumber(t.amount), 0)
      ),
      collectedThisMonth : round2(
        monthTxns.reduce((s, t) => s + toNumber(t.amount), 0) +
        monthDiaryTxns.reduce((s, t) => s + toNumber(t.amount), 0)
      ),
      transactionsToday  : todayTxns.length + todayDiaryTxns.length,
    };
  }

  // ─── Customer Summary ─────────────────────────────────────────────────────
  async getCustomerSummary(centreId: string, customerId: string, user: { sub: string; role: Role }) {
    if (user.role === Role.CUSTOMER && customerId !== user.sub) {
      throw new ForbiddenException('Access denied');
    }
    const customerProfile = await this.userRepo.findOne({
      where: { id: customerId, centreId },
      select: { id: true, name: true, phone: true },
    });

    const loans = await this.loanRepo.find({
      where: { centreId, customerId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    const guaranteedLoansRaw = await this.dataSource.query(
      `
        SELECT
          l.*,
          match.guarantor AS "guarantorMatch"
        FROM loans l
        JOIN LATERAL (
          SELECT g AS guarantor
          FROM jsonb_array_elements(COALESCE(l.guarantors, '[]'::jsonb)) AS g
          WHERE (
            g->>'customerId' = $2
            OR (COALESCE($3::text, '') <> '' AND g->>'phone' = $3::text)
            OR (COALESCE($4::text, '') <> '' AND lower(g->>'name') = lower($4::text))
          )
          LIMIT 1
        ) match ON TRUE
        WHERE l."centreId" = $1
          AND l."deletedAt" IS NULL
        ORDER BY l."createdAt" DESC
      `,
      [centreId, customerId, customerProfile?.phone ?? null, customerProfile?.name ?? null],
    );

    const guaranteedLoans = await this.attachLoanPeopleMany(centreId, guaranteedLoansRaw);

    return {
      customerId,
      totalLoans     : loans.length,
      activeLoans    : loans.filter(l => l.status === LoanStatus.ACTIVE).length,
      closedLoans    : loans.filter(l => l.status === LoanStatus.CLOSED).length,
      preClosedLoans : loans.filter(l => l.status === LoanStatus.PRE_CLOSED).length,
      totalDisbursed : round2(loans.reduce((s, l) => s + toNumber(l.disbursedAmount), 0)),
      totalPayable   : round2(loans.reduce((s, l) => s + toNumber(l.totalPayable), 0)),
      totalPaid      : round2(loans.reduce((s, l) => s + toNumber(l.totalPaid), 0)),
      totalOutstanding: round2(loans.reduce((s, l) => s + toNumber(l.remainingBalance), 0)),
      totalOverdue   : round2(loans.reduce((s, l) => s + this.computeOverdue(l), 0)),
      loans: loans.map(l => ({
        id                : l.id,
        loanAccountNumber : l.loanAccountNumber,
        loanType          : l.loanType,
        status            : l.status,
        principalAmount   : l.principalAmount,
        remainingBalance  : l.remainingBalance,
        overdue           : this.computeOverdue(l),
        ...this.computeEmiStats(l),
      })),
      guaranteedLoans: guaranteedLoans.map((loan: any) => {
        const guarantorMatch = Array.isArray(loan.guarantors)
          ? loan.guarantors.find((item: any) => item?.customerId === customerId) ?? null
          : loan.guarantorMatch ?? null;

        return {
          id: loan.id,
          loanAccountNumber: loan.loanAccountNumber,
          loanType: loan.loanType,
          status: loan.status,
          principalAmount: loan.principalAmount,
          totalPayable: loan.totalPayable,
          remainingBalance: loan.remainingBalance,
          startDate: loan.startDate,
          endDate: loan.endDate,
          createdAt: loan.createdAt,
          customerId: loan.customerId,
          customer: loan.customer ?? null,
          guarantorMatch,
        };
      }),
      guaranteedLoansCount: guaranteedLoans.length,
      totalGuaranteedPrincipal: round2(
        guaranteedLoans.reduce((sum: number, loan: any) => sum + toNumber(loan.principalAmount), 0),
      ),
    };
  }

  // ─── Agent Collection Report ──────────────────────────────────────────────
  async getCollectionReport(
    centreId: string,
    filters: { from?: string; to?: string; agentId?: string },
  ) {
    const params: any[] = [centreId];
    let whereLoan = `tx."centreId" = $1 AND tx."isReversed" = false`;
    let whereDiary = `dt."centreId" = $1 AND dt."isReversed" = false AND dt.type = 'deposit'`;

    if (filters.from) {
      params.push(filters.from);
      whereLoan += ` AND tx."paymentDate" >= $${params.length}`;
      whereDiary += ` AND dt."transactionDate" >= $${params.length}`;
    }
    if (filters.to) {
      params.push(filters.to);
      whereLoan += ` AND tx."paymentDate" <= $${params.length}`;
      whereDiary += ` AND dt."transactionDate" <= $${params.length}`;
    }
    if (filters.agentId) {
      params.push(filters.agentId);
      whereLoan += ` AND tx."collectedBy" = $${params.length}`;
      whereDiary += ` AND dt."performedBy" = $${params.length}`;
    }

    const txns: any[] = await this.dataSource.query(`
      SELECT * FROM (
        SELECT
          tx.id,
          tx."collectedBy" AS "agentId",
          CASE WHEN u.role = 'admin' THEN 'ADMIN' ELSE u.name END AS "agentName",
          tx.type::text,
          tx.amount::numeric AS amount,
          tx."principalPart"::numeric AS "principalPart",
          tx."interestPart"::numeric AS "interestPart",
          tx."penaltyPart"::numeric AS "penaltyPart",
          tx."paymentDate",
          tx."receiptNo",
          tx."paymentMode",
          tx."createdAt"
        FROM loan_transactions tx
        LEFT JOIN users u ON u.id = tx."collectedBy"
        WHERE ${whereLoan}
        
        UNION ALL
        
        SELECT
          dt.id,
          dt."performedBy" AS "agentId",
          CASE WHEN u.role = 'admin' THEN 'ADMIN' ELSE u.name END AS "agentName",
          dt.type::text,
          dt.amount::numeric AS amount,
          0 AS "principalPart",
          0 AS "interestPart",
          0 AS "penaltyPart",
          dt."transactionDate" AS "paymentDate",
          dt."receiptNo",
          'cash' AS "paymentMode",
          dt."createdAt"
        FROM diary_transactions dt
        LEFT JOIN users u ON u.id = dt."performedBy"
        WHERE ${whereDiary}
      ) combined
      ORDER BY combined."paymentDate" DESC, combined."createdAt" DESC
    `, params);

    // Aggregate by collectedBy
    const agentMap = new Map<string, { agentId: string; agentName: string; totalAmount: number; emiCount: number; penaltyCount: number; otherCount: number }>();
    for (const tx of txns) {
      const a = agentMap.get(tx.agentId) ?? {
        agentId: tx.agentId,
        agentName: tx.agentName ?? 'Unknown',
        totalAmount: 0, emiCount: 0, penaltyCount: 0, otherCount: 0,
      };
      a.totalAmount  += toNumber(tx.amount);
      if (tx.type === LoanTransactionType.EMI || tx.type === LoanTransactionType.FULL_PAYMENT) a.emiCount++;
      else if (tx.type === LoanTransactionType.PENALTY) a.penaltyCount++;
      else a.otherCount++;
      agentMap.set(tx.agentId, a);
    }

    return {
      period            : { from: filters.from ?? 'all time', to: filters.to ?? 'today' },
      totalCollected    : round2(txns.reduce((s, t) => s + toNumber(t.amount), 0)),
      totalTransactions : txns.length,
      byAgent: Array.from(agentMap.values()).map(a => ({
        ...a,
        totalAmount: round2(a.totalAmount),
      })),
    };
  }

  // ─── Add Transaction ──────────────────────────────────────────────────────
  async addTransaction(
    centreId: string,
    loanId: string,
    userId: string,
    dto: CreateLoanTransactionDto,
    userRole: Role,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoanTransaction> {
    // S-8: Agents can submit EMI and FULL_PAYMENT (both are payment types)
    // Only PENALTY and ADJUSTMENT are admin-only operations
    if (userRole === Role.AGENT &&
        dto.type !== LoanTransactionType.EMI &&
        dto.type !== LoanTransactionType.FULL_PAYMENT)
      throw new ForbiddenException('Agents can only add EMI or full payment transactions');

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.status !== LoanStatus.ACTIVE)
        throw new BadRequestException(`Cannot add transaction: loan is ${loan.status}`);

      const amount = round2(toNumber(dto.amount));

      // M-4: Prevent overpayment — balance must never go negative
      const remaining = round2(toNumber(loan.remainingBalance));
      if (amount > remaining + 0.01) {
        throw new BadRequestException(
          `Payment amount ₹${amount} exceeds remaining balance ₹${remaining}. Use pre-close for full settlement.`,
        );
      }

      const { principalPart, interestPart, penaltyPart } = this.computeSplit(loan, amount, dto.type);

      const receiptNo = await this.sequences.next(centreId, SequenceType.RECEIPT, qr);

      // --- Handle Diary Deduction ---
      const diaryAmount = dto.diaryAmount ? round2(toNumber(dto.diaryAmount)) : 0;
      let linkedDiaryTxId: string | null = null;

      if (diaryAmount > 0) {
        if (!dto.diaryAccountId) throw new BadRequestException('diaryAccountId is required when diaryAmount > 0');
        if (diaryAmount > amount) throw new BadRequestException('diaryAmount cannot exceed total payment amount');

        const diaryAcc = await qr.manager.findOne(DiaryAccount, { where: { id: dto.diaryAccountId, centreId } });
        if (!diaryAcc) throw new NotFoundException('Diary account not found');
        if (diaryAcc.customerId !== loan.customerId) throw new BadRequestException('Diary account belongs to a different customer');

        const balanceBefore = round2(toNumber(diaryAcc.balance));
        if (diaryAmount > balanceBefore) throw new BadRequestException(`Insufficient diary balance. Available: ₹${balanceBefore}`);

        const balanceAfter = round2(balanceBefore - diaryAmount);
        diaryAcc.balance = balanceAfter;
        diaryAcc.lastWithdrawalDate = new Date(dto.paymentDate);
        diaryAcc.cycleStartDate = new Date(dto.paymentDate); // reset cycle
        await qr.manager.save(DiaryAccount, diaryAcc);

        const dTx = qr.manager.create(DiaryTransaction, {
          centreId,
          accountId      : diaryAcc.id,
          customerId     : diaryAcc.customerId,
          type           : DiaryTransactionType.LOAN_ADJUSTMENT,
          amount         : diaryAmount,
          balanceBefore,
          balanceAfter,
          transactionDate: new Date(dto.paymentDate),
          notes          : `Adjusted towards loan ${loan.loanAccountNumber} (Receipt: ${receiptNo})`,
          performedBy    : userId,
          isReversed     : false,
        });
        const savedDTx = await qr.manager.save(DiaryTransaction, dTx);
        linkedDiaryTxId = savedDTx.id;
      }
      // ------------------------------

      const tx = qr.manager.create(LoanTransaction, {
        centreId,
        loanId,
        customerId  : loan.customerId,
        type        : dto.type,
        amount,
        principalPart,
        interestPart,
        penaltyPart,
        diaryAmount,
        linkedDiaryTxId,
        paymentMode : dto.paymentMode,
        receiptNo,
        paymentDate : new Date(dto.paymentDate),
        collectedBy : userId,
        notes       : dto.notes ?? null,
        isReversed  : false,
      });

      const savedTx = await qr.manager.save(LoanTransaction, tx);

      // Update loan totals
      const oldRemaining     = toNumber(loan.remainingBalance);
      const newTotalPaid     = round2(toNumber(loan.totalPaid) + amount);
      const newRemaining     = round2(oldRemaining - amount);
      loan.totalPaid         = newTotalPaid;
      loan.remainingBalance  = newRemaining;

      // Auto-close if fully paid
      if (newRemaining <= 0) {
        loan.status   = LoanStatus.CLOSED;
        loan.closedAt = new Date();
      }

      await qr.manager.save(Loan, loan);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.CREATE, tableName: 'loan_transactions', recordId: savedTx.id, newData: savedTx as any, ipAddress, userAgent },
        qr,
      );

      await qr.commitTransaction();
      return savedTx;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ─── Get Transactions ─────────────────────────────────────────────────────
  async getTransactions(centreId: string, loanId: string, user: { sub: string; role: Role }) {
    await this.findOne(centreId, loanId, user); // access check
    return this.txRepo.find({
      where: { loanId, centreId },
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Pre-close ────────────────────────────────────────────────────────────
  async preClose(
    centreId: string,
    loanId: string,
    userId: string,
    dto: PreCloseLoanDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Loan> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.status !== LoanStatus.ACTIVE)
        throw new BadRequestException(`Loan is already ${loan.status}`);

      const old = { ...loan };
      loan.status   = LoanStatus.PRE_CLOSED;
      loan.closedAt = new Date();
      if (dto.notes) loan.notes = dto.notes;

      const saved = await qr.manager.save(Loan, loan);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.UPDATE, tableName: 'loans', recordId: loanId, oldData: old as any, newData: saved as any, ipAddress, userAgent },
        qr,
      );

      await qr.commitTransaction();
      return saved;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }
  // ─── Renew Bullet Loan (Interest Payment) ─────────────────────────────────
  /**
   * Atomic renewal: creates RENEWAL transaction + adjusts loan totals + extends
   * endDate — ALL in a single DB transaction to prevent data corruption.
   *
   * Net effect on loan:
   *   totalPaid     += monthlyInterest
   *   totalPayable  += monthlyInterest
   *   remainingBalance stays the same (both sides increase equally)
   *   endDate       += 1 month
   *   status        stays ACTIVE
   */
  async renewBulletLoan(
    centreId: string,
    loanId: string,
    userId: string,
    dto: RenewBulletLoanDto,
    userRole: Role,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoanTransaction> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.loanType !== LoanType.BULLET) throw new BadRequestException('Only Bullet loans can be renewed');
      if (loan.status !== LoanStatus.ACTIVE) throw new BadRequestException(`Loan is ${loan.status}`);

      const monthlyInterest = round2((toNumber(loan.principalAmount) * toNumber(loan.interestRate) / 100) / 12);
      const { principalPart, interestPart, penaltyPart } = this.computeSplit(loan, monthlyInterest, LoanTransactionType.RENEWAL);

      const receiptNo = await this.sequences.next(centreId, SequenceType.RECEIPT, qr);

      // --- Handle Diary Deduction (same logic as addTransaction) ---
      const diaryAmount = dto.diaryAmount ? round2(toNumber(dto.diaryAmount)) : 0;
      let linkedDiaryTxId: string | null = null;

      if (diaryAmount > 0) {
        if (!dto.diaryAccountId) throw new BadRequestException('diaryAccountId is required when diaryAmount > 0');
        if (diaryAmount > monthlyInterest) throw new BadRequestException('diaryAmount cannot exceed renewal amount');

        const diaryAcc = await qr.manager.findOne(DiaryAccount, { where: { id: dto.diaryAccountId, centreId } });
        if (!diaryAcc) throw new NotFoundException('Diary account not found');
        if (diaryAcc.customerId !== loan.customerId) throw new BadRequestException('Diary account belongs to a different customer');

        const balanceBefore = round2(toNumber(diaryAcc.balance));
        if (diaryAmount > balanceBefore) throw new BadRequestException(`Insufficient diary balance. Available: ₹${balanceBefore}`);

        const balanceAfter = round2(balanceBefore - diaryAmount);
        diaryAcc.balance = balanceAfter;
        diaryAcc.lastWithdrawalDate = new Date(dto.paymentDate);
        diaryAcc.cycleStartDate = new Date(dto.paymentDate);
        await qr.manager.save(DiaryAccount, diaryAcc);

        const dTx = qr.manager.create(DiaryTransaction, {
          centreId,
          accountId      : diaryAcc.id,
          customerId     : diaryAcc.customerId,
          type           : DiaryTransactionType.LOAN_ADJUSTMENT,
          amount         : diaryAmount,
          balanceBefore,
          balanceAfter,
          transactionDate: new Date(dto.paymentDate),
          notes          : `Adjusted towards loan ${loan.loanAccountNumber} renewal (Receipt: ${receiptNo})`,
          performedBy    : userId,
          isReversed     : false,
        });
        const savedDTx = await qr.manager.save(DiaryTransaction, dTx);
        linkedDiaryTxId = savedDTx.id;
      }

      // --- Create RENEWAL transaction ---
      const tx = qr.manager.create(LoanTransaction, {
        centreId,
        loanId,
        customerId  : loan.customerId,
        type        : LoanTransactionType.RENEWAL,
        amount      : monthlyInterest,
        principalPart,
        interestPart,
        penaltyPart,
        diaryAmount,
        linkedDiaryTxId,
        paymentMode : dto.paymentMode,
        receiptNo,
        paymentDate : new Date(dto.paymentDate),
        collectedBy : userId,
        notes       : dto.notes ?? null,
        isReversed  : false,
      });
      const savedTx = await qr.manager.save(LoanTransaction, tx);

      // --- Update loan totals atomically ---
      // Both totalPaid and totalPayable increase by the same amount,
      // so remainingBalance stays unchanged. Loan stays ACTIVE.
      const oldLoan = { ...loan };
      loan.totalPaid       = round2(toNumber(loan.totalPaid) + monthlyInterest);
      loan.totalPayable    = round2(toNumber(loan.totalPayable) + monthlyInterest);
      loan.remainingBalance = round2(toNumber(loan.totalPayable) - toNumber(loan.totalPaid));

      if (loan.endDate) {
        loan.endDate = addMonths(new Date(loan.endDate), 1);
      }

      // Status stays ACTIVE — renewal never closes the loan
      await qr.manager.save(Loan, loan);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.CREATE, tableName: 'loan_transactions', recordId: savedTx.id, newData: savedTx as any, ipAddress, userAgent },
        qr,
      );
      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.UPDATE, tableName: 'loans', recordId: loanId, oldData: oldLoan as any, newData: loan as any, ipAddress, userAgent },
        qr,
      );

      await qr.commitTransaction();
      return savedTx;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ─── Apply Bullet Penalty (Add Next Month Interest) ───────────────────────
  async applyBulletPenalty(
    centreId: string,
    loanId: string,
    userId: string,
    dto: ApplyBulletPenaltyDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Loan> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');
      if (loan.loanType !== LoanType.BULLET) throw new BadRequestException('Only Bullet loans can have penalty applied like this');
      if (loan.status !== LoanStatus.ACTIVE) throw new BadRequestException(`Loan is ${loan.status}`);

      const monthlyInterest = round2((toNumber(loan.principalAmount) * toNumber(loan.interestRate) / 100) / 12);
      
      const old = { ...loan };
      loan.totalPayable = round2(toNumber(loan.totalPayable) + monthlyInterest);
      loan.remainingBalance = round2(toNumber(loan.remainingBalance) + monthlyInterest);
      
      if (loan.endDate) {
        loan.endDate = addMonths(new Date(loan.endDate), 1);
      }
      if (dto.notes) {
        loan.notes = loan.notes ? `${loan.notes}\nPenalty applied: ${dto.notes}` : `Penalty applied: ${dto.notes}`;
      }

      const saved = await qr.manager.save(Loan, loan);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.UPDATE, tableName: 'loans', recordId: loanId, oldData: old as any, newData: saved as any, ipAddress, userAgent },
        qr,
      );

      await qr.commitTransaction();
      return saved;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }


  // ─── Reverse Transaction ──────────────────────────────────────────────────
  async reverseTransaction(
    centreId: string,
    loanId: string,
    txId: string,
    userId: string,
    dto: ReverseLoanTransactionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoanTransaction> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();
    try {
      const tx = await qr.manager.findOne(LoanTransaction, { where: { id: txId, loanId, centreId } });
      if (!tx) throw new NotFoundException('Transaction not found');
      if (tx.isReversed) throw new BadRequestException('Transaction already reversed');

      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');

      tx.isReversed = true;
      tx.reversedBy = userId;
      tx.reversedAt = new Date();
      if (dto.notes) tx.notes = dto.notes;

      // Restore loan balances
      loan.totalPaid        = round2(toNumber(loan.totalPaid) - toNumber(tx.amount));
      loan.remainingBalance = round2(toNumber(loan.remainingBalance) + toNumber(tx.amount));
      if (loan.status !== LoanStatus.ACTIVE) {
        loan.status   = LoanStatus.ACTIVE;
        loan.closedAt = null;
      }

      // --- Refund Diary if applicable ---
      if (tx.linkedDiaryTxId) {
        const dTx = await qr.manager.findOne(DiaryTransaction, { where: { id: tx.linkedDiaryTxId, centreId } });
        if (dTx && !dTx.isReversed) {
          dTx.isReversed = true;
          dTx.reversedBy = userId;
          dTx.reversedAt = new Date();
          
          const diaryAcc = await qr.manager.findOne(DiaryAccount, { where: { id: dTx.accountId, centreId } });
          if (diaryAcc) {
            diaryAcc.balance = round2(toNumber(diaryAcc.balance) + toNumber(dTx.amount));
            await qr.manager.save(DiaryAccount, diaryAcc);
          }
          await qr.manager.save(DiaryTransaction, dTx);
        }
      }
      // ----------------------------------

      await qr.manager.save(LoanTransaction, tx);
      await qr.manager.save(Loan, loan);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.REVERSE, tableName: 'loan_transactions', recordId: txId, oldData: { isReversed: false } as any, newData: tx as any, ipAddress, userAgent },
        qr,
      );

      await qr.commitTransaction();
      return tx;
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      await qr.release();
    }
  }

  // ─── Recalculate Loan Totals ────────────────────────────────────────────────
  /**
   * Replays all non-reversed transactions to recompute totalPaid and
   * remainingBalance on the loan. Also auto-updates loan.status:
   *   - remainingBalance <= 0  → CLOSED
   *   - otherwise              → ACTIVE (reopens if it was closed/pre-closed)
   * Must be called inside an active QueryRunner transaction.
   */
  private async recalcLoan(loanId: string, centreId: string, qr: any): Promise<void> {
    const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
    if (!loan) return;

    const txns: LoanTransaction[] = await qr.manager.find(LoanTransaction, {
      where: { loanId, centreId, isReversed: false },
      order: { paymentDate: 'ASC', createdAt: 'ASC' },
    });

    const totalPaid = round2(txns.reduce((sum, t) => sum + toNumber(t.amount), 0));
    const remainingBalance = round2(toNumber(loan.totalPayable) - totalPaid);

    loan.totalPaid = totalPaid;
    loan.remainingBalance = remainingBalance;

    if (remainingBalance <= 0) {
      loan.status = LoanStatus.CLOSED;
      if (!loan.closedAt) loan.closedAt = new Date();
    } else if (loan.status === LoanStatus.CLOSED || loan.status === LoanStatus.PRE_CLOSED) {
      // M-8: Reopen BOTH closed and pre-closed loans if balance is restored by a tx edit/delete
      loan.status = LoanStatus.ACTIVE;
      loan.closedAt = null;
    }

    await qr.manager.save(Loan, loan);
  }

  // ─── Update Loan Transaction ──────────────────────────────────────────────
  async updateLoanTransaction(
    centreId: string,
    loanId: string,
    txId: string,
    userId: string,
    dto: UpdateLoanTransactionDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoanTransaction> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const tx = await qr.manager.findOne(LoanTransaction, { where: { id: txId, loanId, centreId } });
      if (!tx) throw new NotFoundException('Transaction not found');
      if (tx.isReversed) throw new BadRequestException('Cannot edit a reversed transaction');

      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');

      const old = { ...tx };

      if (dto.amount !== undefined) {
        const newAmount = round2(toNumber(dto.amount));
        // Recompute split based on new amount
        const { principalPart, interestPart, penaltyPart } = this.computeSplit(loan, newAmount, tx.type);
        tx.amount        = newAmount;
        tx.principalPart = principalPart;
        tx.interestPart  = interestPart;
        tx.penaltyPart   = penaltyPart;
      }
      if (dto.paymentDate  !== undefined) tx.paymentDate  = new Date(dto.paymentDate) as any;
      if (dto.paymentMode  !== undefined) tx.paymentMode  = dto.paymentMode;
      if (dto.notes        !== undefined) tx.notes        = dto.notes;

      await qr.manager.save(LoanTransaction, tx);
      await this.recalcLoan(loanId, centreId, qr);

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.UPDATE, tableName: 'loan_transactions', recordId: txId, oldData: old as any, newData: tx as any, ipAddress, userAgent },
        qr,
      );
      await qr.commitTransaction();
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
    // Mn-5: Fetch using main repo after QR is released — avoids using a released connection
    return (await this.txRepo.findOne({ where: { id: txId } }))!;
  }

  // ─── Delete Loan Transaction ──────────────────────────────────────────────
  async deleteLoanTransaction(
    centreId: string,
    loanId: string,
    txId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const tx = await qr.manager.findOne(LoanTransaction, { where: { id: txId, loanId, centreId } });
      if (!tx) throw new NotFoundException('Transaction not found');
      if (tx.isReversed) throw new BadRequestException('Cannot delete a reversed transaction');

      // If this tx had a linked diary deduction, refund diary balance
      if (tx.linkedDiaryTxId) {
        const dTx = await qr.manager.findOne(DiaryTransaction, { where: { id: tx.linkedDiaryTxId, centreId } });
        if (dTx && !dTx.isReversed) {
          dTx.isReversed = true;
          dTx.reversedBy = userId;
          dTx.reversedAt = new Date();
          const diaryAcc = await qr.manager.findOne(DiaryAccount, { where: { id: dTx.accountId, centreId } });
          if (diaryAcc) {
            diaryAcc.balance = round2(toNumber(diaryAcc.balance) + toNumber(dTx.amount));
            await qr.manager.save(DiaryAccount, diaryAcc);
          }
          await qr.manager.save(DiaryTransaction, dTx);
        }
      }

      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.DELETE, tableName: 'loan_transactions', recordId: txId, oldData: tx as any, ipAddress, userAgent },
        qr,
      );
      await qr.manager.delete(LoanTransaction, { id: txId });
      await this.recalcLoan(loanId, centreId, qr);

      await qr.commitTransaction();
      return { message: 'Transaction deleted and loan balances recalculated' };
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }

  // ─── Delete Loan (Hard Delete) ─────────────────────────────────────────────
  async deleteLoan(
    centreId: string,
    loanId: string,
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ message: string }> {
    const qr = this.dataSource.createQueryRunner();
    await qr.connect(); await qr.startTransaction();
    try {
      const loan = await qr.manager.findOne(Loan, { where: { id: loanId, centreId } });
      if (!loan) throw new NotFoundException('Loan not found');

      // Find all transactions
      const txns = await qr.manager.find(LoanTransaction, { where: { loanId, centreId } });

      for (const tx of txns) {
        // If this tx had a linked diary deduction, refund diary balance
        if (tx.linkedDiaryTxId) {
          const dTx = await qr.manager.findOne(DiaryTransaction, { where: { id: tx.linkedDiaryTxId, centreId } });
          if (dTx && !dTx.isReversed) {
            dTx.isReversed = true;
            dTx.reversedBy = userId;
            dTx.reversedAt = new Date();
            const diaryAcc = await qr.manager.findOne(DiaryAccount, { where: { id: dTx.accountId, centreId } });
            if (diaryAcc) {
              diaryAcc.balance = round2(toNumber(diaryAcc.balance) + toNumber(dTx.amount));
              await qr.manager.save(DiaryAccount, diaryAcc);
            }
            await qr.manager.save(DiaryTransaction, dTx);
          }
        }
      }

      // Hard delete all transactions
      if (txns.length > 0) {
        await qr.manager.delete(LoanTransaction, { loanId, centreId });
      }

      // Delete loan
      await this.auditLogs.logInTx(
        { centreId, userId, action: AuditAction.DELETE, tableName: 'loans', recordId: loanId, oldData: loan as any, ipAddress, userAgent },
        qr,
      );
      await qr.manager.delete(Loan, { id: loanId, centreId });

      await qr.commitTransaction();
      return { message: 'Loan and its transactions deleted successfully. Related diary entries refunded if applicable.' };
    } catch (e) { await qr.rollbackTransaction(); throw e; } finally { await qr.release(); }
  }
}
