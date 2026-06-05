import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';
import { DiaryTransactionType } from '../../../common/enums/diary-transaction-type.enum';

@Entity('diary_transactions')
@Index(['centreId', 'customerId'])
@Index(['centreId', 'accountId'])
export class DiaryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  accountId: string;

  @Column('uuid')
  customerId: string;

  @Column({ type: 'enum', enum: DiaryTransactionType })
  type: DiaryTransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  /** Balance snapshot before this transaction */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceBefore: number;

  /** Balance snapshot after this transaction */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'date' })
  transactionDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  receiptNo: string | null;

  @Column('uuid')
  performedBy: string;

  @Column({ default: false })
  isReversed: boolean;

  @Column({ type: 'uuid', nullable: true })
  reversedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
