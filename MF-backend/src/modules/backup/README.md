# Backup module

This module performs weekly PostgreSQL backups and uploads them to Google Drive.

Quick steps to test locally:

1. Set environment variables from `.env.example`.
2. Ensure `pg_dump` and `gzip` are available on the host.
3. Start the app in dev mode and call the admin endpoint:

```bash
# get an admin JWT from your auth flow, then:
curl -X POST http://localhost:3000/admin/backup/run -H "Authorization: Bearer <ADMIN_JWT>"
```

Notes:
- The scheduler runs in-process and triggers weekly at the cron defined in `BACKUP_CRON_SCHEDULE`.
- The module stores metadata in `backup_records` table; run migrations or enable TypeORM synchronize to create it.
