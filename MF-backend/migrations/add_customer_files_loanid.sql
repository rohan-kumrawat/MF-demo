-- Backfill migration for existing databases where customer_files already exists
ALTER TABLE customer_files
  ADD COLUMN IF NOT EXISTS "loanId" UUID;

CREATE INDEX IF NOT EXISTS idx_customer_files_loan_id
  ON customer_files("loanId");

CREATE INDEX IF NOT EXISTS idx_customer_files_centre_customer_loan
  ON customer_files("centreId", "customerId", "loanId");
