import {
  IsDateString, IsEnum, IsNumber, IsOptional,
  IsString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UdharEntryType } from '../../../common/enums/udhar-entry-type.enum';

export class UpdateUdharEntryDto {
  @IsOptional()
  @IsEnum(UdharEntryType)
  entryType?: UdharEntryType;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01, { message: 'amount must be greater than 0' })
  amount?: number;

  @IsOptional()
  @IsDateString()
  entryDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: 'interestAmount cannot be negative' })
  interestAmount?: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  remark?: string;
}
