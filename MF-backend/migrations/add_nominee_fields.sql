-- Migration: Add nomineeName and nomineeRelation to users table
-- Run: PGPASSWORD='postgres' psql -h localhost -U postgres -d microfinance -f ~/microfinance-backend/migrations/add_nominee_fields.sql

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "nomineeName"     VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "nomineeRelation" VARCHAR(50)  DEFAULT NULL;
