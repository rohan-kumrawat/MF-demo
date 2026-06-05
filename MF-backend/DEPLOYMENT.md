# Backup Module Deployment & Runbook

1. Environment
   - Set `GOOGLE_SERVICE_ACCOUNT_JSON` to the JSON credentials for a service account with Drive access.
   - Set `GOOGLE_DRIVE_FOLDER_ID` to the target folder.
   - Ensure DB env vars (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`) are set.

2. Install & build
   ```bash
   npm install --legacy-peer-deps
   npm run build
   ```

3. Run (production)
   - Run the NestJS service as usual. The scheduler runs in-process and will trigger weekly at configured cron.

4. Manual trigger (admin-only)
   - POST `/admin/backup/run` with an admin JWT to trigger immediately.

5. Recovery & validation
   - Backups are uploaded to Google Drive; only the latest successful backup is retained.
   - If a backup fails, the previous backup remains untouched.

6. Monitoring
   - Check app logs for `Scheduled backup completed` or `Scheduled backup failed`.
