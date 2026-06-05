import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';

@Entity('daily_register_entries')
@Index(['centreId', 'registerDayId'])
export class DailyRegisterEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  registerDayId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  withdraw: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  deposit: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  payIn: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  payOut: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  recharge: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  commission: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  upi: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  addAmount: number;

  /** Running balance after this entry. Recalculated on edit/delete. */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  /** Backdate allowed */
  @Column({ type: 'timestamp' })
  entryTime: Date;

  @Column('uuid')
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
