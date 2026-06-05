import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { UdharEntryType } from '../../../common/enums/udhar-entry-type.enum';

@Entity('udhar_entries')
@Index(['centreId', 'personId'])
@Index(['centreId', 'entryDate'])
export class UdharEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  personId: string;

  @Column({ type: 'enum', enum: UdharEntryType })
  entryType: UdharEntryType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  interestAmount: number | null;

  @Column({ type: 'date', nullable: true })
  dueDate: Date | null;

  /** Running balance snapshot after this entry */
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  balanceAfter: number;

  /** Backdate allowed */
  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ type: 'text', nullable: true })
  remark: string | null;

  @Column('uuid')
  createdBy: string;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
