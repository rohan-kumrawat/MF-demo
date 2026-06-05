import {
  IsBoolean, IsDateString, IsOptional, IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  fatherHusbandName?: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  /** Date when customer became a member */
  @IsOptional()
  @IsDateString()
  memberSince?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Nominee name (for customer KYC) */
  @IsOptional()
  @IsString()
  nomineeName?: string;

  /** Nominee relation — e.g. Wife, Son, Father, Brother */
  @IsOptional()
  @IsString()
  nomineeRelation?: string;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
