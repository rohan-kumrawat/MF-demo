import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, QueryFailedError, DataSource, In } from 'typeorm';
import { User } from './entities/user.entity';
import { DiaryAccount } from '../diary/entities/diary-account.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../../common/enums/role.enum';
import { SequencesService } from '../sequences/sequences.service';
import { SequenceType } from '../../common/enums/sequence-type.enum';
import * as bcrypt from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { addDays, addMinutes } from 'date-fns';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly sequencesService: SequencesService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) { }

  async create(centreId: string, dto: CreateUserDto): Promise<User> {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const userData: any = {
      centreId,
      username: dto.username,
      passwordHash,
      role: dto.role,
      name: dto.name,
      phone: dto.phone,
      address: dto.address,
    };

    // KYC fields only for CUSTOMER role
    if (dto.role === Role.CUSTOMER) {
      userData.fatherHusbandName = dto.fatherHusbandName;
      userData.aadharNumber = dto.aadharNumber;
      userData.memberSince = dto.memberSince;
      userData.accountName = dto.accountName;
      userData.nomineeName = dto.nomineeName ?? null;
      userData.nomineeRelation = dto.nomineeRelation ?? null;

      const qr = this.dataSource.createQueryRunner();
      await qr.connect();
      await qr.startTransaction();
      try {
        userData.customerCode = await this.sequencesService.next(centreId, SequenceType.CUSTOMER, qr);
        const user = this.repo.create(userData);
        const saved = await qr.manager.save(user);
        await qr.commitTransaction();
        return Array.isArray(saved) ? saved[0] : saved;
      } catch (e) {
        await qr.rollbackTransaction();
        if (e instanceof QueryFailedError && (e as any).code === '23505') {
          throw new BadRequestException('Username already exists for this centre');
        }
        throw e;
      } finally {
        await qr.release();
      }
    } else {
      const user = this.repo.create(userData);
      try {
        const saved = await this.repo.save(user);
        return Array.isArray(saved) ? saved[0] : saved;
      } catch (e) {
        // Handle unique constraint (username per centre) as a client error
        if (e instanceof QueryFailedError && (e as any).code === '23505') {
          throw new BadRequestException('Username already exists for this centre');
        }
        throw e;
      }
    }
  }

  async findAll(centreId: string, role?: Role, name?: string, status?: string, risk?: string, agent?: string, page = 1, limit = 50) {
    const qb = this.repo.createQueryBuilder('user')
      .where('user.centreId = :centreId', { centreId })
      .andWhere('user.deletedAt IS NULL');

    if (role) qb.andWhere('user.role = :role', { role });
    if (name) {
      qb.leftJoin(DiaryAccount, 'diary_search', 'diary_search.customerId = user.id AND diary_search.deletedAt IS NULL');
      qb.andWhere('(user.name ILIKE :name OR user.customerCode ILIKE :name OR diary_search.diaryName ILIKE :name)', { name: `%${name}%` });
    }

    if (agent || status || risk) {
      qb.leftJoin('loans', 'loan', 'loan."customerId" = user.id AND loan.status = :loanStatus', { loanStatus: 'active' });

      if (agent) {
        qb.andWhere('loan."agentId" = :agent', { agent });
      }

      if (status) {
        if (status === 'defaulter') {
          qb.andWhere(`
            loan.id IS NOT NULL AND (
              (loan."loanType" = 'emi' AND 
               (EXTRACT(YEAR FROM age(CURRENT_DATE, loan."startDate")) * 12 + EXTRACT(MONTH FROM age(CURRENT_DATE, loan."startDate"))) * loan."emiAmount" > loan."totalPaid"
              ) OR
              (loan."loanType" = 'flexible' AND 
               LEAST(CURRENT_DATE - loan."startDate", COALESCE(loan."totalDays", CURRENT_DATE - loan."startDate")) * loan."dailyInstallment" > loan."totalPaid"
              ) OR
              (loan."loanType" = 'weekly' AND 
               LEAST(GREATEST(CURRENT_DATE - loan."startDate", 0) / 7, COALESCE(loan."totalWeeks", GREATEST(CURRENT_DATE - loan."startDate", 0) / 7)) * loan."weeklyInstallment" > loan."totalPaid"
              ) OR
              (loan."loanType" = 'bullet' AND 
               loan."endDate" < CURRENT_DATE AND loan."remainingBalance" > 0
              )
            )
          `);
        } else if (status === 'due' || status === 'active') {
          // Simplification for 'due' and 'active' just checking for presence of an active loan.
          qb.andWhere('loan.id IS NOT NULL');
        }
      }

      if (risk) {
        // Fallback for risk filter in case it was meant to be implemented later
        // e.g. qb.andWhere('user.risk = :risk', { risk }); 
      }
    }

    qb.orderBy('user.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [users, total] = await qb.getManyAndCount();

    if (users.length === 0) {
      return { data: users, total, page, limit };
    }

    const userIds = users.map(u => u.id);

    // Fetch active loan balances
    const loanBalances = await this.dataSource.query(
      `SELECT "customerId", SUM("remainingBalance") as "activeLoan"
       FROM loans
       WHERE "customerId" = ANY($1) AND "status" = 'active'
       GROUP BY "customerId"`,
      [userIds]
    );

    // Fetch diary balances
    const diaryBalances = await this.dataSource.query(
      `SELECT "customerId", SUM("balance") as "diaryBalance"
       FROM diary_accounts
       WHERE "customerId" = ANY($1) AND "isActive" = true AND "deletedAt" IS NULL
       GROUP BY "customerId"`,
      [userIds]
    );

    const data = users.map(user => {
      const loanRow = loanBalances.find((l: any) => l.customerId === user.id);
      const diaryRow = diaryBalances.find((d: any) => d.customerId === user.id);
      
      return {
        ...user,
        activeLoan: loanRow ? Number(loanRow.activeLoan) : 0,
        diaryBalance: diaryRow ? Number(diaryRow.diaryBalance) : 0,
        // Default risk/status for frontend if needed
        risk: 'Low',
        emiStatus: 'active'
      };
    });

    return { data, total, page, limit };
  }

  async searchCustomers(centreId: string, search?: string) {
    const qb = this.repo.createQueryBuilder('user')
      .select(['user.id', 'user.name', 'user.customerCode'])
      .where('user.centreId = :centreId', { centreId })
      .andWhere('user.role = :role', { role: Role.CUSTOMER })
      .andWhere('user.deletedAt IS NULL');
    
    if (search) {
      qb.andWhere('user.name ILIKE :search', { search: `%${search}%` });
    }
    
    qb.limit(20);
    return qb.getMany();
  }

  async findOne(centreId: string, id: string): Promise<User> {
    const user = await this.repo.findOne({ where: { id, centreId, deletedAt: IsNull() } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** M-6: Public lookup by ID — replaces bracket-access to private repo in auth.service */
  async findById(id: string): Promise<User | null> {
    return this.repo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async findByUsername(centreId: string, username: string): Promise<User | null> {
    return this.repo.findOne({ where: { centreId, username, deletedAt: IsNull() } });
  }

  async update(centreId: string, id: string, dto: UpdateUserDto, callerRole: Role): Promise<User> {
    const user = await this.findOne(centreId, id);

    // M-2: Only ADMIN can toggle isActive — extract it before the mass-assign
    const { isActive, username, password, ...safeFields } = dto;
    Object.assign(user, safeFields);

    if (callerRole === Role.ADMIN) {
      if (isActive !== undefined) {
        user.isActive = isActive;
      }
      if (username) {
        user.username = username;
      }
      if (password) {
        user.passwordHash = await bcrypt.hash(password, 12);
      }
    }

    try {
      return await this.repo.save(user);
    } catch (e) {
      if (e instanceof QueryFailedError && (e as any).code === '23505') {
        throw new BadRequestException('Username already exists for this centre');
      }
      throw e;
    }
  }

  async changePassword(centreId: string, id: string, dto: import('./dto/change-password.dto').ChangePasswordDto): Promise<void> {
    const user = await this.findOne(centreId, id);

    const isMatch = await bcrypt.compare(dto.oldPassword, user.passwordHash);
    if (!isMatch) {
      throw new BadRequestException('Incorrect current password');
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    await this.repo.save(user);
  }

  async requestEmailOtp(centreId: string, id: string, newEmail: string): Promise<void> {
    const user = await this.findOne(centreId, id);
    
    // Check if new email is already taken by someone else in the same centre
    const existing = await this.repo.findOne({ where: { centreId, email: newEmail } });
    if (existing && existing.id !== user.id) {
      throw new BadRequestException('Email already in use by another account');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpiry = addMinutes(new Date(), 10);
    user.pendingEmail = newEmail;

    await this.repo.save(user);
    await this.mailService.sendEmailVerificationOtp(newEmail, otp);
  }

  async verifyEmailOtp(centreId: string, id: string, otp: string): Promise<void> {
    const user = await this.findOne(centreId, id);

    if (!user.resetOtp || !user.resetOtpExpiry || user.resetOtp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > user.resetOtpExpiry) {
      throw new BadRequestException('OTP has expired');
    }

    if (!user.pendingEmail) {
      throw new BadRequestException('No pending email request found');
    }

    user.email = user.pendingEmail;
    user.pendingEmail = null;
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await this.repo.save(user);
  }

  async hardDelete(centreId: string, id: string): Promise<void> {
    await this.findOne(centreId, id); // validates user exists

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    try {
      // 1. Diary Accounts & Transactions
      const diaryAccounts = await qr.manager.find('diary_accounts', { where: { customerId: id, centreId } });
      if (diaryAccounts.length > 0) {
        const accountIds = diaryAccounts.map((a: any) => a.id);
        await qr.manager.delete('diary_transactions', { accountId: In(accountIds) });
        await qr.manager.delete('diary_accounts', { id: In(accountIds) });
      }

      // 2. Loans & Transactions
      const loans = await qr.manager.find('loans', { where: { customerId: id, centreId } });
      if (loans.length > 0) {
        const loanIds = loans.map((l: any) => l.id);
        await qr.manager.delete('loan_transactions', { loanId: In(loanIds) });
        await qr.manager.delete('loans', { id: In(loanIds) });
      }

      // 3. Files
      await qr.manager.delete('customer_files', { customerId: id, centreId });

      // 4. Finally, User
      await qr.manager.delete(User, { id, centreId });

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();
      throw err;
    } finally {
      await qr.release();
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, 12);
    await this.repo.update(id, { passwordHash: hash });
  }

  async setCustomerCode(id: string, code: string): Promise<void> {
    await this.repo.update(id, { customerCode: code });
  }
}
