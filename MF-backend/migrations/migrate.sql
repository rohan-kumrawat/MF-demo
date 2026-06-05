-- Migration v4: Add new loan_transaction type enum values
-- Run: psql -U postgres -d microfinance_db -f migrate.sql

-- Add new values to the existing enum type
-- (PostgreSQL allows ADD VALUE but not REMOVE — old values stay harmlessly)
ALTER TYPE loan_transactions_type_enum ADD VALUE IF NOT EXISTS 'emi';
ALTER TYPE loan_transactions_type_enum ADD VALUE IF NOT EXISTS 'full_payment';
ALTER TYPE loan_transactions_type_enum ADD VALUE IF NOT EXISTS 'other';

SELECT 'Migration v4 complete! New transaction types added.' AS status;
