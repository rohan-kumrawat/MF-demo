import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BackupRecord, BackupStatus } from './backup-record.entity';
import * as child_process from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { GoogleDriveService } from './google-drive.service';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private running = false;

  constructor(
    @InjectRepository(BackupRecord)
    private readonly repo: Repository<BackupRecord>,
    private readonly drive: GoogleDriveService,
  ) {}

  private dumpFilePath(ts: string) {
    return path.join('/tmp', `backup-${ts}.sql.gz`);
  }

  async runBackup(): Promise<BackupRecord> {
    if (this.running) throw new Error('Backup already running');
    this.running = true;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = this.dumpFilePath(ts);

    const record = this.repo.create({ status: BackupStatus.PENDING, fileName: filePath });
    await this.repo.save(record);

    try {
      await this.createDump(filePath);
      const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
      const baseName = path.basename(filePath);
      const uploadRes = await this.drive.uploadFile(filePath, baseName, folderId);

      record.status = BackupStatus.SUCCESS;
      record.driveFileId = uploadRes.id;
      record.size = uploadRes.size;
      record.fileName = baseName;
      await this.repo.save(record);

      // delete previous successful backup(s)
      const previous = await this.repo.find({ where: { status: BackupStatus.SUCCESS } });
      for (const p of previous) {
        if (p.id === record.id) continue;
        try {
          if (p.driveFileId) await this.drive.deleteFile(p.driveFileId);
          p.deletedAt = new Date();
          await this.repo.save(p);
        } catch (err) {
          this.logger.warn('Failed deleting previous backup: ' + (err as Error).message);
        }
      }

      // cleanup local
      try { fs.unlinkSync(filePath); } catch (e) {}

      this.running = false;
      return record;
    } catch (err) {
      record.status = BackupStatus.FAILED;
      record.errorMessage = (err as Error).message;
      await this.repo.save(record);
      this.running = false;
      throw err;
    }
  }

  private createDump(outPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      let host = process.env.DB_HOST || 'localhost';
      let port = process.env.DB_PORT || '5432';
      let user = process.env.DB_USERNAME || process.env.DB_USER || 'postgres';
      let pass = process.env.DB_PASSWORD || '';
      let db = process.env.DB_NAME || 'microfinance';

      if (process.env.DATABASE_URL) {
        try {
          const parsed = new URL(process.env.DATABASE_URL);
          host = parsed.hostname || host;
          port = parsed.port || port;
          user = decodeURIComponent(parsed.username) || user;
          pass = decodeURIComponent(parsed.password) || pass;
          db = parsed.pathname.slice(1) || db;
        } catch (e) {
          this.logger.warn('Failed to parse DATABASE_URL: ' + (e as Error).message);
        }
      }

      const env = Object.assign({}, process.env, { PGPASSWORD: pass });

      // pg_dump | gzip > outPath
      const dump = child_process.spawn('pg_dump', ['-h', host, '-p', port, '-U', user, db], { env });
      const gzip = child_process.spawn('gzip', ['-c']);
      const out = fs.createWriteStream(outPath);

      dump.stdout.pipe(gzip.stdin);
      gzip.stdout.pipe(out);

      dump.on('error', (err) => reject(err));
      gzip.on('error', (err) => reject(err));
      out.on('finish', () => resolve());

      dump.on('close', (code) => {
        if (code !== 0) reject(new Error('pg_dump exited with ' + code));
      });
    });
  }
}
