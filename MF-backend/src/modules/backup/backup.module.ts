import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { BackupRecord } from './backup-record.entity';
import { BackupService } from './backup.service';
import { BackupScheduler } from './backup.scheduler';
import { GoogleDriveService } from './google-drive.service';
import { BackupController } from './backup.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BackupRecord]), ScheduleModule.forRoot()],
  providers: [BackupService, BackupScheduler, GoogleDriveService],
  controllers: [BackupController],
  exports: [BackupService],
})
export class BackupModule {}
