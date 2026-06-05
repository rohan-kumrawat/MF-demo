import {
  IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMode } from '../../../common/enums/payment-mode.enum';

export class UpdateLoanTransactionDto {
  /** Amount received — backend recalculates principal/interest/penalty split */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount?: number;

  @IsOptional()
  @IsEnum(PaymentMode)
  paymentMode?: PaymentMode;

  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
