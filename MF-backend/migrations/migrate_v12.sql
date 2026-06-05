-- Migration v12: Add RENEWAL and PENALTY types to loan_transactions_type_enum
-- Safe to re-run: ADD VALUE IF NOT EXISTS is idempotent.

ALTER TYPE loan_transactions_type_enum ADD VALUE IF NOT EXISTS 'renewal';
ALTER TYPE loan_transactions_type_enum ADD VALUE IF NOT EXISTS 'penalty';

SELECT 'Migration v12 complete! New transaction types added.' AS status;
