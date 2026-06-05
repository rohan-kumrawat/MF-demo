import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiaryController } from './diary.controller';
import { DiaryService } from './diary.service';
import { DiaryAccount } from './entities/diary-account.entity';
import { DiaryTransaction } from './entities/diary-transaction.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';
import { SequencesModule } from '../sequences/sequences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DiaryAccount, DiaryTransaction]),
    AuditLogsModule,
    IdempotencyModule,
    SequencesModule,
  ],
  controllers: [DiaryController],
  providers: [DiaryService],
  exports: [DiaryService],
})
export class DiaryModule {}
