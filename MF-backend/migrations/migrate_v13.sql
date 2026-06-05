-- Migration v13: Add weekly loan type and weekly installment fields
-- Safe to re-run: all statements are idempotent.

BEGIN;

DO $$
DECLARE
  enum_type_name text;
BEGIN
  SELECT t.typname
    INTO enum_type_name
  FROM pg_type t
  JOIN pg_enum e ON e.enumtypid = t.oid
  JOIN pg_attribute a ON a.atttypid = t.oid
  JOIN pg_class c ON c.oid = a.attrelid
  WHERE c.relname = 'loans'
    AND a.attname = 'loanType'
  GROUP BY t.typname
  HAVING bool_or(e.enumlabel = 'emi')
     AND bool_or(e.enumlabel = 'bullet')
     AND bool_or(e.enumlabel = 'flexible')
  LIMIT 1;

  IF enum_type_name IS NOT NULL THEN
    EXECUTE format('ALTER TYPE %I ADD VALUE IF NOT EXISTS %L', enum_type_name, 'weekly');
    RAISE NOTICE 'Added weekly value to enum type %.', enum_type_name;
  ELSE
    RAISE NOTICE 'Could not detect loans.loanType enum type — skipping enum update.';
  END IF;
END $$;

ALTER TABLE public.loans
  ADD COLUMN IF NOT EXISTS "weeklyInstallment" numeric(12,2),
  ADD COLUMN IF NOT EXISTS "totalWeeks" integer;

COMMIT;

\echo '✅  Migration v13 complete — weekly loan fields added.'