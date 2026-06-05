import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('vault_credentials')
@Index(['centreId', 'adminId'])
export class VaultCredential {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  adminId: string;

  @Column({ type: 'varchar', length: 100 })
  companyName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  loginId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  password: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  pinNumber: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  loginPassword: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionPassword: string | null;

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
