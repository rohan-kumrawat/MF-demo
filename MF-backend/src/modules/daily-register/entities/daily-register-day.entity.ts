import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';

@Entity('daily_register_days')
@Index(['centreId', 'entryDate'], { unique: true })
export class DailyRegisterDay {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  openingBalance: number;

  /** Recalculated after every entry mutation */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  closingBalance: number;

  @Column('uuid')
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
