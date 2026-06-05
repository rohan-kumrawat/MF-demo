import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('vault_cards')
@Index(['centreId', 'adminId'])
export class VaultCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  adminId: string;

  @Column({ type: 'varchar', length: 100 })
  bankName: string;

  @Column({ type: 'varchar', length: 100 })
  cardNumber: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  cvv: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  expDate: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  billGenerateDate: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dueDate: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  billAmount: number | null;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
