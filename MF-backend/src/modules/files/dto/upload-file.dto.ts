import { IsString, IsOptional, MaxLength, IsUUID, Allow } from 'class-validator';

export class UploadFileDto {
  @Allow()
  files?: unknown;

  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  loanId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  documentType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
