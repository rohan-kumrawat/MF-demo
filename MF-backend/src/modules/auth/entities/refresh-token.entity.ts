import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';

@Entity('refresh_tokens')
@Index(['userId'])
// S-10: Composite index for fast per-centre token lookups (used by CentreIsolationGuard)
@Index(['userId', 'centreId'])
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  /** centreId stored for fast isolation queries */
  @Column('uuid')
  centreId: string;

  /** bcrypt hash of the raw refresh token */
  @Column()
  tokenHash: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
