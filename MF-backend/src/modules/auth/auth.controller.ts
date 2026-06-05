import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordOtpDto } from './dto/reset-password-otp.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '../../common/enums/role.enum';
import { CentreIsolationGuard } from '../../common/guards/centre-isolation.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ── Strict rate limit: 5 attempts per 60 seconds ─────────────────────────
  @Post('login')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  // ── Password reset: strict rate limit to prevent OTP brute force ─────────
  @Post('forgot-password')
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password-otp')
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  resetPasswordWithOtp(@Body() dto: ResetPasswordOtpDto) {
    return this.authService.resetPasswordWithOtp(dto);
  }

  // ── Authenticated endpoints — default throttle applies ───────────────────
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard, CentreIsolationGuard)
  changePassword(@CurrentUser() user: any, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, dto);
  }

  @Post('reset-password/:userId')
  @UseGuards(JwtAuthGuard, CentreIsolationGuard, RolesGuard)
  @Roles(Role.ADMIN)
  resetPassword(
    @CurrentUser() user: any,
    @Param('userId') userId: string,
    @Body() dto: ResetPasswordDto,
  ) {
    return this.authService.resetPassword(user.centreId, userId, dto);
  }
}
