-- Run: psql -U postgres -d microfinance -f migrate_v7.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS "email" VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "reset_otp" VARCHAR(6) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "reset_otp_expiry" TIMESTAMP DEFAULT NULL;

-- Add a unique constraint if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_users_email') THEN
        ALTER TABLE users ADD CONSTRAINT uq_users_email UNIQUE ("email");
    END IF;
END $$;

-- Set initial email for upendra.patel
UPDATE users SET email = 'kirtancsc.bhoinda@gmail.com' WHERE username = 'upendra.patel';

-- Update narendra.rathore to narendra.rathode and add email
UPDATE users 
SET username = 'narendra.rathode', 
    name = 'Narendra Rathode', 
    email = 'nrathode@hotmail.com' 
WHERE username = 'narendra.rathore';

\echo 'Migration v7 complete! Email and OTP fields added to users table.'
