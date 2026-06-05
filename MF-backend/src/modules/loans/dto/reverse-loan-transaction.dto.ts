import { IsOptional, IsString } from 'class-validator';

export class ReverseLoanTransactionDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
