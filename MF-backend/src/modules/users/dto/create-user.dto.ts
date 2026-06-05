import {
  IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, IsDateString,
} from 'class-validator';
import { Role } from '../../../common/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty({ message: 'username must not be empty' })
  @MinLength(2, { message: 'username must be at least 2 characters' })
  username: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsNotEmpty({ message: 'name must not be empty' })
  @MinLength(2, { message: 'name must be at least 2 characters' })
  name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  /** Father's / Husband's name (for customer KYC) */
  @IsOptional()
  @IsString()
  fatherHusbandName?: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;

  /** Date when customer became a member */
  @IsOptional()
  @IsDateString()
  memberSince?: string;

  /** Account name (for customer KYC) */
  @IsOptional()
  @IsString()
  accountName?: string;

  /** Nominee name (for customer KYC) */
  @IsOptional()
  @IsString()
  nomineeName?: string;

  /** Nominee relation — e.g. Wife, Son, Father, Brother */
  @IsOptional()
  @IsString()
  nomineeRelation?: string;
}
