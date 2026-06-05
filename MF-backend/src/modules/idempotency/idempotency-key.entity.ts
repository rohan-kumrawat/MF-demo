import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('idempotency_keys')
@Index(['key', 'centreId', 'endpoint'], { unique: true })
export class IdempotencyKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Client-supplied unique request key (UUID recommended) */
  @Column({ length: 255 })
  key: string;

  @Column('uuid')
  userId: string;

  @Column('uuid')
  centreId: string;

  /** Identifies the API operation, e.g. "loan-transaction", "diary-deposit" */
  @Column({ length: 100 })
  endpoint: string;

  /** Serialized response returned on the first successful execution */
  @Column({ type: 'jsonb' })
  responseBody: object;

  /** Key expires 24 hours after creation — old keys can be pruned safely */
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
