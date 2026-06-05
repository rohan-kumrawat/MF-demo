import {
  IsDateString, IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRegisterDayDto {
  @IsDateString()
  entryDate: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  openingBalance?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}
