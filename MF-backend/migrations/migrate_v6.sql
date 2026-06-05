-- Run: psql -U postgres -d microfinance -f migrate_v6.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS "aadhar_number" VARCHAR(20) DEFAULT NULL;

\echo 'Migration v6 complete! Aadhar Number field added to users table.'
