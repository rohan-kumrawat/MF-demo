import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';
import { AuditAction } from '../../common/enums/audit-action.enum';
import { QueryRunner } from 'typeorm';

interface CreateAuditParams {
  centreId: string;
  userId: string;
  action: AuditAction;
  tableName: string;
  recordId: string;
  oldData?: Record<string, any>;
  newData?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly repo: Repository<AuditLog>,
  ) {}

  /** Write an audit log entry inside a QueryRunner transaction. */
  async logInTx(params: CreateAuditParams, qr: QueryRunner): Promise<void> {
    const entry = qr.manager.create(AuditLog, {
      centreId  : params.centreId,
      userId    : params.userId,
      action    : params.action,
      tableName : params.tableName,
      recordId  : params.recordId,
      oldData   : params.oldData   ?? null,
      newData   : params.newData   ?? null,
      ipAddress : params.ipAddress ?? null,
      userAgent : params.userAgent ?? null,
    });
    await qr.manager.save(AuditLog, entry);
  }

  /** Write audit log outside of a transaction (best-effort). */
  async log(params: CreateAuditParams): Promise<void> {
    const entry = this.repo.create({
      centreId  : params.centreId,
      userId    : params.userId,
      action    : params.action,
      tableName : params.tableName,
      recordId  : params.recordId,
      oldData   : params.oldData   ?? null,
      newData   : params.newData   ?? null,
      ipAddress : params.ipAddress ?? null,
      userAgent : params.userAgent ?? null,
    });
    await this.repo.save(entry);
  }

  async findAll(centreId: string, page = 1, limit = 50) {
    const [data, total] = await this.repo.findAndCount({
      where: { centreId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data, total, page, limit };
  }
}
