import { IsOptional, IsString } from 'class-validator';

export class PreCloseLoanDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
