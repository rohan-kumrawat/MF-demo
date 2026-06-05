import {
  IsDateString, IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class DiaryWithdrawDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsDateString()
  transactionDate: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
