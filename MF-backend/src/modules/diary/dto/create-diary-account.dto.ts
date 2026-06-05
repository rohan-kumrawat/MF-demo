import { IsUUID, IsString, IsOptional, MaxLength, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDiaryAccountDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  diaryName?: string;

  /**
   * Opening balance (optional).
   * Agar diya to ek DEPOSIT transaction automatically create hogi aaj ki date se.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  openingBalance?: number;
}
