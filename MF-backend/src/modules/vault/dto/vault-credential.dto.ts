import { IsString, IsOptional } from 'class-validator';

export class CreateVaultCredentialDto {
  @IsString()
  companyName: string;

  @IsOptional()
  @IsString()
  loginId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  pinNumber?: string;

  @IsOptional()
  @IsString()
  loginPassword?: string;

  @IsOptional()
  @IsString()
  transactionPassword?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateVaultCredentialDto {
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsString()
  loginId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  pinNumber?: string;

  @IsOptional()
  @IsString()
  loginPassword?: string;

  @IsOptional()
  @IsString()
  transactionPassword?: string;

  @IsOptional()
  @IsString()
  remarks?: string;
}
