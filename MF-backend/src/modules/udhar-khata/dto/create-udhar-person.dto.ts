import {
  IsOptional, IsString, IsNumber, Min, IsEnum, ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UdharEntryType } from '../../../common/enums/udhar-entry-type.enum';

export class CreateUdharPersonDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  /**
   * Opening balance amount (optional).
   * Agar diya to ek initial entry automatically create hogi.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  openingBalance?: number;

  /**
   * Required if openingBalance > 0.
   * liya = unhone humein paise diye (hum unke liye liable hain)
   * diya = humne unhe paise diye (wo humse liable hain)
   */
  @ValidateIf(o => o.openingBalance !== undefined && o.openingBalance > 0)
  @IsEnum(UdharEntryType)
  openingBalanceType?: UdharEntryType;
}
