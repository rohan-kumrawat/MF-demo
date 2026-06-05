-- ============================================================
-- Migration: Add DIARY and UDHAR_KHATA sequence support
-- Run on: Local & AWS Lightsail
-- ============================================================

-- Step 1: Add new enum values to the sequence type enum
--         (IF NOT EXISTS prevents errors on re-run)
ALTER TYPE centre_sequences_type_enum ADD VALUE IF NOT EXISTS 'diary';
ALTER TYPE centre_sequences_type_enum ADD VALUE IF NOT EXISTS 'udhar_khata';

-- Step 2: Add accountCode column to diary_accounts
ALTER TABLE diary_accounts
  ADD COLUMN IF NOT EXISTS "accountCode" VARCHAR(30) UNIQUE;

-- Step 3: Add personCode column to udhar_persons
ALTER TABLE udhar_persons
  ADD COLUMN IF NOT EXISTS "personCode" VARCHAR(30) UNIQUE;

-- Step 4: Insert DIARY and UDHAR_KHATA sequence rows for each centre.
--         Uses the centreCode already stored in centre_sequences so the
--         prefix (KCSC / GK / etc.) is automatically correct per environment.
--         Wrapped in DO block because ADD VALUE needs its own transaction boundary.
DO $$
DECLARE
  r RECORD;
  t TEXT;
BEGIN
  FOR r IN SELECT DISTINCT "centreId", "centreCode" FROM centre_sequences LOOP
    FOREACH t IN ARRAY ARRAY['diary', 'udhar_khata'] LOOP
      IF NOT EXISTS (
        SELECT 1 FROM centre_sequences
        WHERE "centreId" = r."centreId" AND type = t::centre_sequences_type_enum
      ) THEN
        INSERT INTO centre_sequences ("centreId", "centreCode", type, "currentValue")
        VALUES (r."centreId", r."centreCode", t::centre_sequences_type_enum, 0);
      END IF;
    END LOOP;
  END LOOP;
END $$;
