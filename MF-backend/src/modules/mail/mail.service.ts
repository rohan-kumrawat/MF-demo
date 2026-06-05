import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is required but not set');
    }
    this.resend = new Resend(apiKey);
  }

  async sendPasswordResetOtp(toEmail: string, otp: string) {
    try {
      const response = await this.resend.emails.send({
        from: 'no-reply@mail.gurukripaconnect.top',
        to: toEmail,
        subject: 'Microfinance Admin - Password Reset OTP',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>You requested a password reset for your admin account.</p>
            <p>Here is your 6-digit OTP code:</p>
            <h1 style="letter-spacing: 5px; color: #4F46E5;">${otp}</h1>
            <p><em>This code is valid for 10 minutes. Do not share it with anyone.</em></p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      this.logger.log(`Password reset OTP sent to ${toEmail}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send email to ${toEmail}`, error);
      throw error;
    }
  }

  async sendEmailVerificationOtp(toEmail: string, otp: string) {
    try {
      const response = await this.resend.emails.send({
        from: 'no-reply@mail.gurukripaconnect.top',
        to: toEmail,
        subject: 'Microfinance Admin - Verify Your New Email',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Email Verification</h2>
            <p>You requested to update your email address for your admin account.</p>
            <p>Here is your 6-digit OTP code to verify this email address:</p>
            <h1 style="letter-spacing: 5px; color: #10B981;">${otp}</h1>
            <p><em>This code is valid for 10 minutes. Do not share it with anyone.</em></p>
            <p>If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      this.logger.log(`Email verification OTP sent to ${toEmail}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to send email to ${toEmail}`, error);
      throw error;
    }
  }
}
