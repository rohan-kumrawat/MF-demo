import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as fs from 'fs';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private drive: any;

 constructor() {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN || '';

    if (clientId && clientSecret && refreshToken) {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      this.drive = google.drive({ version: 'v3', auth: oauth2Client });
      return;
    }

    this.logger.warn(
      'Google Drive not configured: set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN',
    );
  } catch (err) {
    this.logger.warn('Google Drive not configured: ' + (err as Error).message);
  }
}

  private async assertSharedDriveFolder(folderId?: string) {
    return true;
  }

  async uploadFile(filePath: string, fileName: string, folderId?: string) {
    if (!this.drive) throw new Error('Google Drive not configured');
    await this.assertSharedDriveFolder(folderId);

    try {
      const res = await this.drive.files.create({
        requestBody: {
          name: fileName,
          parents: [folderId || process.env.GOOGLE_DRIVE_FOLDER_ID!],
        },
        media: {
          body: fs.createReadStream(filePath),
        },
        fields: 'id,size',
        supportsAllDrives: true,
      });
      return { id: res.data.id, size: parseInt(res.data.size || '0', 10) };
    } catch (err) {
      const message = (err as Error).message || '';
      if (message.includes('storage quota')) {
        throw new Error(
          'Google service accounts cannot upload to personal My Drive because they have no storage quota. Use a Shared Drive folder or OAuth delegation with a user account.',
        );
      }
      throw err;
    }
  }

  async deleteFile(fileId: string) {
    if (!this.drive) throw new Error('Google Drive not configured');
    await this.drive.files.delete({ fileId, supportsAllDrives: true });
  }
}
