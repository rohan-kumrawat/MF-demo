import {
  IsDateString, IsEnum, IsNumber, IsOptional,
  IsString, IsUUID, Min, IsArray, ValidateNested,
  IsNotEmpty, MaxLength, ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LoanType }    from '../../../common/enums/loan-type.enum';
import { PaymentMode } from '../../../common/enums/payment-mode.enum';

export class GuarantorDto {
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  relation: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class FamilyMemberDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  relation: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  aadharNumber?: string;
}

export class CreateLoanDto {
  @IsUUID()
  customerId: string;

  @IsOptional()
  @IsUUID()
  agentId?: string;

  @IsEnum(LoanType)
  loanType: LoanType;

  // ── Amounts ──────────────────────────────────────────────────────────
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  principalAmount: number;

  /** Annual interest rate (%) — e.g. 18 for 18% p.a. */
  @ValidateIf((obj, value) => value !== '')
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  interestRate: number;

  /** Number of months — required for EMI and bullet loans only */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ValidateIf((loan) => loan.loanType === LoanType.EMI || loan.loanType === LoanType.BULLET)
  tenureMonths?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  fileCharge?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  otherCharge?: number;

  /**
   * Total repayable amount.
   * For EMI flat rate: principalAmount + (principalAmount × interestRate/100 × tenureMonths/12)
   * Frontend calculates and sends this; backend stores it.
   */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  totalPayable: number;

  /**
   * Monthly instalment — required for EMI loans ONLY.
   * Flat-rate formula: totalPayable / tenureMonths
   * Frontend calculates this live as user types.
   */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ValidateIf((loan) => loan.loanType === LoanType.EMI)
  emiAmount?: number;

  /** Flexible loan only */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ValidateIf((loan) => loan.loanType === LoanType.FLEXIBLE)
  dailyInstallment?: number;

  /** Flexible loan only */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ValidateIf((loan) => loan.loanType === LoanType.FLEXIBLE)
  totalDays?: number;

  /** Weekly loan only */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ValidateIf((loan) => loan.loanType === LoanType.WEEKLY)
  weeklyInstallment?: number;

  /** Weekly loan only */
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @ValidateIf((loan) => loan.loanType === LoanType.WEEKLY)
  totalWeeks?: number;

  // ── Dates ─────────────────────────────────────────────────────────────
  @IsDateString()
  startDate: string;

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
  @ValidateIf((obj, value) => value !== '')
  @IsDateString()
  memberSince?: string;

  /**
   * endDate — For BULLET loans only: provide the repayment deadline.
   * For EMI loans: auto-computed server-side as startDate + tenureMonths.
  * For FLEXIBLE and WEEKLY loans: not needed.
   */
  @IsOptional()
  @ValidateIf((obj, value) => value !== '')
  @IsDateString()
  endDate?: string;

  // ── Extra loan info ───────────────────────────────────────────────────
  @IsOptional()
  @IsString()
  @MaxLength(255)
  purposeOfLoan?: string;

  /** Mode in which customer will repay EMI (cash/upi/bank) */
  @IsOptional()
  @IsEnum(PaymentMode)
  emiPaymentMode?: PaymentMode;

  // ── Guarantors (max 2) ────────────────────────────────────────────────
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
  hasPreviousLoan?: boolean;

  @IsOptional()
  @ValidateIf((loan) => loan.hasPreviousLoan === true)
  @IsNumber()
  @Min(0)
  previousLoanAmount?: number;

  @IsOptional()
  @ValidateIf((loan) => loan.hasPreviousLoan === true)
  @IsString()
  previousLoanStatus?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
