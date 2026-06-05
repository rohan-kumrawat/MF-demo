import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordOtpDto {
  @IsString()
  @IsNotEmpty({ message: 'Please provide a username or email' })
  identifier: string;

  @IsString()
  @IsNotEmpty()
  otp: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty()
  newPassword: string;
}
