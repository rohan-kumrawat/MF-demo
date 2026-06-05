import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { LoanType }    from '../../../common/enums/loan-type.enum';
import { LoanStatus }  from '../../../common/enums/loan-status.enum';
import { PaymentMode } from '../../../common/enums/payment-mode.enum';

export interface Guarantor {
  customerId?: string;
  name: string;
  phone: string;
  relation: string;
  aadharNumber: string;
  address: string;
}

export interface FamilyMember {
  name: string;
  relation: string;
  phone: string;
  aadharNumber: string;
}

@Entity('loans')
@Index(['centreId', 'customerId'])
@Index(['centreId', 'status'])
@Index(['centreId', 'agentId'])
export class Loan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Format: LOAN-C{centreCode}-{00000} */
  @Column({ length: 30 })
  loanAccountNumber: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  customerId: string;

  /** Agent who created / manages this loan */
  @Column({ type: 'uuid', nullable: true })
  agentId: string | null;

  @Column({ type: 'enum', enum: LoanType })
  loanType: LoanType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  principalAmount: number;

  /** Annual interest rate in % — e.g. 18 means 18% p.a. */
  @Column({ type: 'decimal', precision: 6, scale: 2, default: '0.00' })
  interestRate: number;

  /** Number of months for EMI/bullet loans */
  @Column({ type: 'int', nullable: true })
  tenureMonths: number | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  fileCharge: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  otherCharge: number;

  /** Actual amount given to customer: principalAmount − fileCharge − otherCharge */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  disbursedAmount: number;

  /** What the loan was taken for */
  @Column({ type: 'varchar', length: 255, nullable: true })
  purposeOfLoan: string | null;

  /** Mode in which customer will repay EMI (cash/upi/bank) */
  @Column({ type: 'varchar', length: 20, nullable: true })
  emiPaymentMode: PaymentMode | null;

  /** Up to 2 guarantors stored as JSONB */
  @Column({ type: 'jsonb', nullable: true })
  guarantors: Guarantor[] | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalPayable: number;

  /** Flexible loan only */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  dailyInstallment: number | null;

  /** Flexible loan only */
  @Column({ type: 'int', nullable: true })
  totalDays: number | null;

  /** Weekly loan only */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  weeklyInstallment: number | null;

  /** Weekly loan only */
  @Column({ type: 'int', nullable: true })
  totalWeeks: number | null;

  /** EMI loan only */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  emiAmount: number | null;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  fatherOrHusbandName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  aadharNumber: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  accountNumber: string | null;

  @Column({ type: 'date', nullable: true })
  memberSince: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  familyMembers: FamilyMember[] | null;

  @Column({ type: 'boolean', default: false })
  hasPreviousLoan: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  previousLoanAmount: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  previousLoanStatus: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  totalPaid: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  remainingBalance: number;

  @Column({ type: 'enum', enum: LoanStatus, default: LoanStatus.ACTIVE })
  status: LoanStatus;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
