import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { Role } from '../../../common/enums/role.enum';

@Entity('users')
@Index(['centreId', 'username'], { unique: true })
@Index(['centreId', 'role'])
// Mn-8: Email unique per-centre, not globally — same person can appear in two centres
@Index(['centreId', 'email'], { unique: true, where: '"email" IS NOT NULL' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column({ length: 50 })
  username: string;

  @Column()
  passwordHash: string;

  // Mn-8: unique:true removed — uniqueness now enforced by the composite index above
  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  pendingEmail: string | null;

  @Column({ type: 'varchar', length: 6, nullable: true })
  resetOtp: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  vaultPin: string | null;

  @Column({ type: 'timestamp', nullable: true })
  resetOtpExpiry: Date | null;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'text', nullable: true })
  address: string | null;

  /** Auto-generated for role=customer via centre_sequences */
  @Column({ type: 'varchar', length: 20, nullable: true })
  customerCode: string | null;

  /** Father's / Husband's name — KYC field for customers */
  @Column({ type: 'varchar', length: 100, nullable: true })
  fatherHusbandName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  aadharNumber: string | null;

  /** Date since customer is a member of this centre */
  @Column({ type: 'date', nullable: true })
  memberSince: Date | null;

  /** Account name — KYC field for customers (optional) */
  @Column({ type: 'varchar', length: 100, nullable: true })
  accountName: string | null;

  /** Nominee name — KYC field for customers */
  @Column({ type: 'varchar', length: 100, nullable: true })
  nomineeName: string | null;

  /** Nominee relation — e.g. Wife, Son, Father */
  @Column({ type: 'varchar', length: 50, nullable: true })
  nomineeRelation: string | null;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
