import 'dotenv/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule }          from './modules/auth/auth.module';
import { UsersModule }         from './modules/users/users.module';
import { CentresModule }       from './modules/centres/centres.module';
import { LoansModule }         from './modules/loans/loans.module';
import { DiaryModule }         from './modules/diary/diary.module';
import { DailyRegisterModule } from './modules/daily-register/daily-register.module';
import { UdharKhataModule }    from './modules/udhar-khata/udhar-khata.module';
import { AuditLogsModule }     from './modules/audit-logs/audit-logs.module';
import { SequencesModule }     from './modules/sequences/sequences.module';
import { FilesModule }         from './modules/files/files.module';
import { IdempotencyModule }   from './modules/idempotency/idempotency.module';
import { HealthController }   from './modules/health/health.controller';
import { ReportsModule }      from './modules/reports/reports.module';
import { VaultModule }        from './modules/vault/vault.module';
import { BackupModule }       from './modules/backup/backup.module';

// Entities
import { Centre }              from './modules/centres/entities/centre.entity';
import { User }                from './modules/users/entities/user.entity';
import { RefreshToken }        from './modules/auth/entities/refresh-token.entity';
import { CentreSequence }      from './modules/sequences/entities/centre-sequence.entity';
import { Loan }                from './modules/loans/entities/loan.entity';
import { LoanTransaction }     from './modules/loans/entities/loan-transaction.entity';
import { DiaryAccount }        from './modules/diary/entities/diary-account.entity';
import { DiaryTransaction }    from './modules/diary/entities/diary-transaction.entity';
import { DailyRegisterDay }    from './modules/daily-register/entities/daily-register-day.entity';
import { DailyRegisterEntry }  from './modules/daily-register/entities/daily-register-entry.entity';
import { UdharPerson }         from './modules/udhar-khata/entities/udhar-person.entity';
import { UdharEntry }          from './modules/udhar-khata/entities/udhar-entry.entity';
import { AuditLog }            from './modules/audit-logs/entities/audit-log.entity';
import { CustomerFile }        from './modules/files/entities/file.entity';
import { IdempotencyKey }      from './modules/idempotency/idempotency-key.entity';
import { VaultCard }           from './modules/vault/entities/vault-card.entity';
import { VaultCredential }     from './modules/vault/entities/vault-credential.entity';

@Module({
  imports: [
    // ── Rate Limiting ─────────────────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        name    : 'default',
        ttl     : 60_000,   // 60 seconds window
        limit   : 100,      // 100 requests per window (general endpoints)
      },
    ]),
    TypeOrmModule.forRoot({
      type        : 'postgres',
      url         : process.env.DATABASE_URL,
      host        : process.env.DATABASE_URL ? undefined : (process.env.DB_HOST ?? 'localhost'),
      port        : process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT ?? '5432', 10),
      username    : process.env.DATABASE_URL ? undefined : (process.env.DB_USERNAME ?? 'postgres'),
      password    : process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD ?? 'postgres'),
      database    : process.env.DATABASE_URL ? undefined : (process.env.DB_NAME ?? 'microfinance'),
      ssl         : process.env.DB_SSL === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sslmode=require'))
                    ? { rejectUnauthorized: false }
                    : false,
      synchronize : process.env.TYPEORM_SYNCHRONIZE === 'true',
      logging     : process.env.TYPEORM_LOGGING     === 'true',
      entities: [
        Centre, User, RefreshToken, CentreSequence,
        Loan, LoanTransaction,
        DiaryAccount, DiaryTransaction,
        DailyRegisterDay, DailyRegisterEntry,
        UdharPerson, UdharEntry,
        AuditLog,
        CustomerFile,
        IdempotencyKey,
        VaultCard,
        VaultCredential,
        // Backup entity
        require('./modules/backup/backup-record.entity').BackupRecord,
      ],
    }),
    AuthModule,
    UsersModule,
    CentresModule,
    LoansModule,
    DiaryModule,
    DailyRegisterModule,
    UdharKhataModule,
    AuditLogsModule,
    SequencesModule,
    FilesModule,
    IdempotencyModule,
    ReportsModule,
    VaultModule,
    BackupModule,
  ],
  controllers: [
    // S-1: Health check registered directly (no separate module needed)
    HealthController,
  ],
  providers: [
    // Apply throttle globally — auth controller overrides with stricter limits
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
