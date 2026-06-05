-- Migration v5: Add diary integration columns to loan_transactions
-- Run: psql -U postgres -d microfinance_db -f migrate_v5.sql

-- 1. Add diaryAmount and linkedDiaryTxId to loan_transactions
ALTER TABLE loan_transactions
ADD COLUMN IF NOT EXISTS "diaryAmount" numeric(12,2) NOT NULL DEFAULT '0.00',
ADD COLUMN IF NOT EXISTS "linkedDiaryTxId" uuid DEFAULT null;

-- 2. Add 'loan_adjustment' to diary_transactions_type_enum
-- (PostgreSQL allows ADD VALUE to enums)
ALTER TYPE diary_transactions_type_enum ADD VALUE IF NOT EXISTS 'loan_adjustment';

SELECT 'Migration v5 complete! Diary to Loan integration fields added.' AS status;
