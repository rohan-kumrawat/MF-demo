-- Migration: Add diary_name column to diary_accounts
-- Allows a customer to have multiple diaries with distinct names.
-- Existing rows get the default name 'Default'.

ALTER TABLE diary_accounts
  ADD COLUMN IF NOT EXISTS diary_name VARCHAR(100) NOT NULL DEFAULT 'Default';

-- Drop old unique constraint if it exists (one diary per customer was enforced there)
-- Replace with a plain non-unique index so multiple diaries per customer are allowed.
-- Note: index name may differ on your DB; check with \d diary_accounts and drop manually if needed.
DROP INDEX IF EXISTS idx_diary_accounts_centre_customer;

CREATE INDEX IF NOT EXISTS idx_diary_accounts_centre_customer
  ON diary_accounts (centre_id, customer_id);
