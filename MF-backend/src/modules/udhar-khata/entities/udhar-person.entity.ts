import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';

@Entity('udhar_persons')
@Index(['centreId'])
export class UdharPerson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 30, nullable: true, unique: true })
  personCode: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string | null;

  /**
   * +ve = person owes us (we gave — diya)
   * -ve = we owe person (they gave — liya)
   */
  @Column({ type: 'decimal', precision: 12, scale: 2, default: '0.00' })
  netBalance: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
