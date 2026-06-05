-- Run: psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f migrate_v8.sql
-- Daily Register: add `upi` provider/app field

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'daily_register_entries'
      AND column_name = 'upi'
  ) THEN
    ALTER TABLE daily_register_entries
      ALTER COLUMN "upi" TYPE VARCHAR(50)
      USING CASE
        WHEN "upi" IS NULL THEN NULL
        ELSE "upi"::text
      END;
  ELSE
    ALTER TABLE daily_register_entries
      ADD COLUMN "upi" VARCHAR(50) DEFAULT NULL;
  END IF;
END $$;

\echo 'Migration v8 complete! daily_register_entries.upi added/converted to VARCHAR(50).'
