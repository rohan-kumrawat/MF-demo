import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';
import { AuditAction } from '../../../common/enums/audit-action.enum';

@Entity('audit_logs')
@Index(['centreId', 'tableName'])
@Index(['centreId', 'userId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  centreId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction;

  @Column({ length: 50 })
  tableName: string;

  @Column('uuid')
  recordId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldData: Record<string, any> | null;

  @Column({ type: 'jsonb', nullable: true })
  newData: Record<string, any> | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
