import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMode } from '../../../common/enums/payment-mode.enum';

export class RenewBulletLoanDto {
  @IsDateString()
  paymentDate: string;

  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  diaryAmount?: number;

  @IsOptional()
  @IsString()
  diaryAccountId?: string;
}
