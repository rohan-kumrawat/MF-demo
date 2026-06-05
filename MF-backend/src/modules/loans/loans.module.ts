import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoansController } from './loans.controller';
import { LoansService } from './loans.service';
import { Loan } from './entities/loan.entity';
import { LoanTransaction } from './entities/loan-transaction.entity';
import { User } from '../users/entities/user.entity';
import { Centre } from '../centres/entities/centre.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SequencesModule } from '../sequences/sequences.module';
import { IdempotencyModule } from '../idempotency/idempotency.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Loan, LoanTransaction, User, Centre]),
    AuditLogsModule,
    SequencesModule,
    IdempotencyModule,
  ],
  controllers: [LoansController],
  providers: [LoansService],
  exports: [LoansService],
})
export class LoansModule {}
