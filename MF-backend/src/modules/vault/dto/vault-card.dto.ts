import { IsString, IsOptional, IsNumber, Length } from 'class-validator';

export class CreateVaultCardDto {
  @IsString()
  bankName: string;

  @IsString()
  cardNumber: string;

  @IsOptional()
  @IsString()
  @Length(3, 4)
  cvv?: string;

  @IsOptional()
  @IsString()
  expDate?: string;

  @IsOptional()
  @IsString()
  billGenerateDate?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  billAmount?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class UpdateVaultCardDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  @Length(3, 4)
  cvv?: string;

  @IsOptional()
  @IsString()
  expDate?: string;

  @IsOptional()
  @IsString()
  billGenerateDate?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsNumber()
  billAmount?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
