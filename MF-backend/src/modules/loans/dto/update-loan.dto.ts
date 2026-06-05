import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMode } from '../../../common/enums/payment-mode.enum';
import { GuarantorDto, FamilyMemberDto } from './create-loan.dto';

export class UpdateLoanDto {
  @IsOptional()
  @IsUUID()
  agentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  principalAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  interestRate?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  tenureMonths?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fileCharge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  otherCharge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalPayable?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  emiAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  dailyInstallment?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weeklyInstallment?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  totalWeeks?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsString()
  fatherOrHusbandName?: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsDateString()
  memberSince?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  purposeOfLoan?: string;

  @IsOptional()
  @IsEnum(PaymentMode)
  emiPaymentMode?: PaymentMode;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GuarantorDto)
  guarantors?: GuarantorDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FamilyMemberDto)
  familyMembers?: FamilyMemberDto[];

  @IsOptional()
  @IsBoolean()
  hasPreviousLoan?: boolean;

  @IsOptional()
  @IsNumber()
  previousLoanAmount?: number;

  @IsOptional()
  @IsString()
  previousLoanStatus?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
