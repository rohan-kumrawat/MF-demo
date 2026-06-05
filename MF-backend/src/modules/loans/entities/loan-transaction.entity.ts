import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';
import { LoanTransactionType } from '../../../common/enums/loan-transaction-type.enum';
import { PaymentMode }         from '../../../common/enums/payment-mode.enum';

@Entity('loan_transactions')
@Index(['centreId', 'loanId'])
@Index(['centreId', 'paymentDate'])
@Index(['centreId', 'receiptNo'], { unique: true })
export class LoanTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  loanId: string;

  @Column('uuid')
  customerId: string;

  @Column({ type: 'enum', enum: LoanTransactionType })
  type: LoanTransactionType;

  /** Must equal principalPart + interestPart + penaltyPart */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  principalPart: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  interestPart: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  penaltyPart: number;

  /** How much of the total amount was deducted from the Diary */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  diaryAmount: number;

  @Column({ type: 'enum', enum: PaymentMode })
  paymentMode: PaymentMode;

  /** Format: RCP-C{centreCode}-{00000}. NOT NULL — always generated. */
  @Column({ length: 30, nullable: false })
  receiptNo: string;

  @Column({ type: 'date' })
  paymentDate: Date;

  @Column('uuid')
  collectedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ default: false })
  isReversed: boolean;

  @Column({ type: 'uuid', nullable: true })
  reversedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date | null;

  @Column({ type: 'uuid', nullable: true })
  linkedDiaryTxId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
