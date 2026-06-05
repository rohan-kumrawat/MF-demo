import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
  ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('diary_accounts')
@Index(['centreId', 'customerId'])
export class DiaryAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  customerId: string;

  @Column({ type: 'varchar', length: 100, default: 'Default' })
  diaryName: string;

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  accountCode: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'customerId' })
  customer: User;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  balance: number;

  /**
   * Reset to today on any partial withdrawal.
   * Interest eligible only when (today - cycleStartDate) >= 365 days.
   */
  @Column({ type: 'date', nullable: true })
  cycleStartDate: Date | null;

  @Column({ type: 'date', nullable: true })
  lastWithdrawalDate: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
