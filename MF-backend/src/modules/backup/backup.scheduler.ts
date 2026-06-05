import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BackupService } from './backup.service';

@Injectable()
export class BackupScheduler {
  private readonly logger = new Logger(BackupScheduler.name);

  constructor(private readonly backup: BackupService) {}

  // Sunday 02:00 Asia/Kolkata — stable across server timezones
  @Cron('0 2 * * 0', {
    timeZone: 'Asia/Kolkata',
  })
  async handleWeeklyBackup() {
    this.logger.log('Starting scheduled weekly backup');
    try {
      await this.backup.runBackup();
      this.logger.log('Scheduled backup completed');
    } catch (err) {
      this.logger.error('Scheduled backup failed: ' + (err as Error).message);
    }
  }
}
