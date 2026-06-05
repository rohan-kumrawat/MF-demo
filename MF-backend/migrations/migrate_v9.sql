-- Run: psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f migrate_v9.sql
-- Users: add `account_name` optional field for customer KYC

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'account_name'
  ) THEN
    ALTER TABLE users
      ADD COLUMN "account_name" VARCHAR(100) DEFAULT NULL;
  END IF;
END $$;

\echo 'Migration v9 complete! users.account_name added.'
