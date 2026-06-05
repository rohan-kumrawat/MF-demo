import {
  IsDateString, IsNumber, IsOptional, IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRegisterEntryDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  withdraw?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  deposit?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  payIn?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  payOut?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  recharge?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  commission?: number;

  @IsOptional()
  @IsString()
  upi?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  addAmount?: number;

  @IsOptional()
  @IsString()
  remark?: string;

  /** Backdate allowed */
  @IsOptional()
  @IsDateString()
  entryTime?: string;
}
