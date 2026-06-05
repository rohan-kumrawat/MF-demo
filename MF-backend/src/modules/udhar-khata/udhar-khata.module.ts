import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UdharKhataController } from './udhar-khata.controller';
import { UdharKhataService } from './udhar-khata.service';
import { UdharPerson } from './entities/udhar-person.entity';
import { UdharEntry } from './entities/udhar-entry.entity';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { SequencesModule } from '../sequences/sequences.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UdharPerson, UdharEntry]),
    AuditLogsModule,
    SequencesModule,
  ],
  controllers: [UdharKhataController],
  providers: [UdharKhataService],
})
export class UdharKhataModule {}
