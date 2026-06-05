import {
  IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LoanTransactionType } from '../../../common/enums/loan-transaction-type.enum';
import { PaymentMode }         from '../../../common/enums/payment-mode.enum';

export class CreateLoanTransactionDto {
  /** EMI = regular instalment | PENALTY = late fee | OTHER = misc credit */
  @IsEnum(LoanTransactionType)
  type: LoanTransactionType;

  /** Total amount received — backend auto-splits into principal/interest/penalty */
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  /** Amount deducted from diary (if any) */
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  diaryAmount?: number;

  /** Required if diaryAmount > 0 */
  @IsUUID()
  @IsOptional()
  diaryAccountId?: string;

  /** cash | upi | bank */
  @IsEnum(PaymentMode)
  paymentMode: PaymentMode;

  @IsDateString()
  paymentDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
