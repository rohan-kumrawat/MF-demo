import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { timingSafeEqual } from 'crypto';
import { addDays } from 'date-fns';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { Centre } from '../centres/entities/centre.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordOtpDto } from './dto/reset-password-otp.dto';
import { MailService } from '../mail/mail.service';
import { DiaryAccount } from '../diary/entities/diary-account.entity';
import { Loan } from '../loans/entities/loan.entity';
import { LoanStatus } from '../../common/enums/loan-status.enum';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly tokenRepo: Repository<RefreshToken>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Centre)
    private readonly centreRepo: Repository<Centre>,
    @InjectRepository(DiaryAccount)
    private readonly diaryAccountRepo: Repository<DiaryAccount>,
    @InjectRepository(Loan)
    private readonly loanRepo: Repository<Loan>,
    private readonly mailService: MailService,
  ) {}

  async login(dto: LoginDto) {
    let user: User | null = null;
    let centreName: string | undefined;

    if (dto.centreName) {
      // Look up centre by village name (case-insensitive)
      const centre = await this.centreRepo
        .createQueryBuilder('c')
        .where('UPPER(c.name) = UPPER(:name)', { name: dto.centreName })
        .getOne();

      if (!centre) throw new UnauthorizedException(`Centre "${dto.centreName}" not found`);

      user = await this.usersService.findByUsername(centre.id, dto.username);
      centreName = centre.name;
    } else {
      // No centre specified — find user globally (works when username is unique across both centres)
      user = await this.userRepo.findOne({
        where: { username: dto.username, isActive: true },
      });
      if (user) {
        const centre = await this.centreRepo.findOne({ where: { id: user.centreId } });
        centreName = centre?.name;
      }
    }

    if (!user || !user.isActive) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(user.id, user.centreId, user.role, centreName);
  }

  // ── C-4 FIX: Filter tokens by userId first, then bcrypt-compare only that subset ──
  async refresh(rawToken: string) {
    // Decode (without verifying) to get userId for fast DB filtering
    let userId: string | null = null;
    try {
      const decoded = this.jwtService.decode(rawToken) as any;
      userId = decoded?.sub ?? null;
    } catch {
      // will be caught below
    }

    if (!userId) throw new UnauthorizedException('Invalid refresh token');

    // Only load tokens belonging to this user (not the whole table)
    const userTokens = await this.tokenRepo.find({ where: { userId } });

    let matched: RefreshToken | null = null;
    for (const t of userTokens) {
      if (await bcrypt.compare(rawToken, t.tokenHash)) {
        matched = t;
        break;
      }
    }

    if (!matched || matched.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    // Rotate — delete old, issue new
    await this.tokenRepo.delete(matched.id);

    let payload: any;
    try {
      payload = this.jwtService.verify(rawToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return this.issueTokens(payload.sub, payload.centreId, payload.role, undefined, payload.loanIds);
  }

  // ── C-4 FIX: Filter tokens by userId first ────────────────────────────────
  async logout(rawToken: string) {
    // Decode (without verifying) to get userId for fast DB filtering
    let userId: string | null = null;
    try {
      const decoded = this.jwtService.decode(rawToken) as any;
      userId = decoded?.sub ?? null;
    } catch {
      // ignore — best effort logout
    }

    const userTokens = userId
      ? await this.tokenRepo.find({ where: { userId } })
      : await this.tokenRepo.find({ where: {} }); // fallback (shouldn't happen)

    for (const t of userTokens) {
      if (await bcrypt.compare(rawToken, t.tokenHash)) {
        await this.tokenRepo.delete(t.id);
        return;
      }
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    // M-6: Use public findById() instead of bracket-accessing the private repo
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!valid) throw new BadRequestException('Current password is incorrect');
    await this.usersService.updatePassword(userId, dto.newPassword);
  }

  async resetPassword(adminCentreId: string, targetUserId: string, dto: ResetPasswordDto) {
    const user = await this.usersService.findOne(adminCentreId, targetUserId);
    await this.usersService.updatePassword(user.id, dto.newPassword);
  }

  private async resolveDiaryIds(
    centreId: string,
    customerId: string,
    role: string,
  ): Promise<string[]> {
    if (role !== Role.CUSTOMER) return [];

    // M-7: Do NOT auto-create — only return existing accounts.
    // Diary accounts are created explicitly by admins via POST /diary/accounts.
    const accounts = await this.diaryAccountRepo.find({
      where: { centreId, customerId, deletedAt: IsNull(), isActive: true },
      select: ['id'],
      order: { createdAt: 'ASC' },
    });

    return accounts.map(a => a.id);
  }

  private async resolveLoanIds(
    centreId: string,
    customerId: string,
    role: string,
    loanIds?: string[],
  ): Promise<string[]> {
    if (role !== Role.CUSTOMER) return [];
    if (loanIds && loanIds.length > 0) return loanIds;

    const loans = await this.loanRepo.find({
      where: {
        centreId,
        customerId,
        status: LoanStatus.ACTIVE,
        deletedAt: IsNull(),
      },
      select: ['id'],
      order: { createdAt: 'DESC' },
    });

    return loans.map(l => l.id);
  }

  private async issueTokens(
    sub: string,
    centreId: string,
    role: string,
    centreName?: string,
    loanIds?: string[],
  ) {
    const diaryIds     = await this.resolveDiaryIds(centreId, sub, role);
    const resolvedLoanIds = await this.resolveLoanIds(centreId, sub, role, loanIds);

    const payload = { sub, centreId, role, type: 'access', diaryIds, loanIds: resolvedLoanIds };

    const accessToken = this.jwtService.sign(payload, {
      secret    : process.env.JWT_ACCESS_SECRET,
      expiresIn : process.env.JWT_ACCESS_EXPIRES_IN ?? '12h',
    });

    const refreshPayload = { sub, centreId, role, type: 'refresh', diaryIds, loanIds: resolvedLoanIds };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret    : process.env.JWT_REFRESH_SECRET,
      expiresIn : process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
    });

    const tokenHash = await bcrypt.hash(refreshToken, 10);

    // S-6: Parse JWT_REFRESH_EXPIRES_IN so DB expiry stays in sync with the JWT
    // Supports formats: '7d', '30d', '1d'. Defaults to 7 days.
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';
    const expiryDays = parseInt(refreshExpiresIn, 10) || 7;
    const expiresAt = addDays(new Date(), expiryDays);

    await this.tokenRepo.save(
      this.tokenRepo.create({ userId: sub, centreId, tokenHash, expiresAt }),
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id        : sub,
        centreId,
        centreName: centreName ?? null,
        diaryIds,
        loanIds   : resolvedLoanIds,
        role,
      },
    };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const isEmail = dto.identifier.includes('@');
    const user = await this.userRepo.findOne({ 
      where: isEmail 
        ? { email: dto.identifier, isActive: true } 
        : { username: dto.identifier, isActive: true } 
    });
    
    if (!user) {
      throw new BadRequestException('no account found');
    }
    
    if (user.role !== Role.ADMIN) {
      const roleName = user.role === Role.KIOSK ? 'Kiosk-User' : 
                       user.role.charAt(0).toUpperCase() + user.role.slice(1);
                       
      throw new BadRequestException(`आपका अकाउंट एक ${roleName} अकाउंट है, यह विकल्प सिर्फ एडमिन के लिए है। अगर आप अपना पासवर्ड भूल गए हैं, तो कृपया सेंटर से संपर्क करें।`);
    }

    if (!user.email) {
      throw new BadRequestException('इस अकाउंट में कोई ईमेल आईडी दर्ज नहीं है। कृपया सेंटर से संपर्क करें।');
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    // OTP valid for 10 minutes
    user.resetOtpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    
    await this.userRepo.save(user);

    // Send email
    await this.mailService.sendPasswordResetOtp(user.email, otp);

    const [localPart, domain] = user.email.split('@');
    const visibleLen = Math.max(1, Math.floor(localPart.length / 2));
    const maskedLocal = localPart.substring(0, visibleLen) + '*'.repeat(localPart.length - visibleLen);
    const maskedEmail = `${maskedLocal}@${domain}`;

    return { 
      message: `OTP has been sent to ${maskedEmail}`,
      maskedEmail 
    };
  }

  // ── C-5 FIX: constant-time OTP comparison via timingSafeEqual ────────────
  async resetPasswordWithOtp(dto: ResetPasswordOtpDto) {
    const isEmail = dto.identifier.includes('@');
    const user = await this.userRepo.findOne({ 
      where: isEmail 
        ? { email: dto.identifier, isActive: true } 
        : { username: dto.identifier, isActive: true } 
    });

    // Always check expiry first to avoid short-circuiting before compare
    const otpExpired = !user?.resetOtpExpiry || user.resetOtpExpiry.getTime() < Date.now();
    const storedOtp  = user?.resetOtp ?? '';

    // Constant-time comparison — prevents timing attacks even on wrong-length input
    // Wrap in new Uint8Array() to satisfy TS: Uint8Array<ArrayBuffer> vs Uint8Array<ArrayBufferLike>
    let otpMatch = false;
    if (storedOtp.length > 0 && storedOtp.length === dto.otp.length) {
      try {
        otpMatch = timingSafeEqual(
          new Uint8Array(Buffer.from(storedOtp, 'utf8')),
          new Uint8Array(Buffer.from(dto.otp,   'utf8')),
        );
      } catch {
        otpMatch = false;
      }
    }

    if (!user || user.role !== Role.ADMIN || !otpMatch || otpExpired) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(dto.newPassword, salt);
    
    // Clear OTP
    user.resetOtp = null;
    user.resetOtpExpiry = null;

    await this.userRepo.save(user);

    return { message: 'Password has been reset successfully.' };
  }
}
