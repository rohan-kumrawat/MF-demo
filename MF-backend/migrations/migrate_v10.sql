-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration v10  ·  Security Hardening — Email Unique Per-Centre
-- ═══════════════════════════════════════════════════════════════════════════════
-- What changed:
--   The global unique constraint on users.email is replaced with a
--   per-centre composite partial index:  UNIQUE (centre_id, email) WHERE email IS NOT NULL
--
--   Reason: The same person (e.g. same mobile-number email) can legitimately
--   be a customer in multiple centres.  The old global constraint would block that.
--
-- Run on AWS Lightsail:
--   psql -h <DB_HOST> -U <DB_USER> -d <DB_NAME> -f migrate_v10.sql
--
-- Safe to re-run: all statements are idempotent (IF EXISTS / IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Step 1: Drop old global unique constraint (may be named differently) ──────
DO $$
DECLARE
  v_constraint TEXT;
BEGIN
  -- Find the exact constraint name dynamically (TypeORM may vary)
  SELECT conname INTO v_constraint
  FROM   pg_constraint
  WHERE  conrelid = 'public.users'::regclass
    AND  contype  = 'u'
    AND  conkey   = ARRAY[
           (SELECT attnum FROM pg_attribute
            WHERE attrelid = 'public.users'::regclass AND attname = 'email')
         ]::smallint[];

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', v_constraint);
    RAISE NOTICE 'Dropped old unique constraint: %', v_constraint;
  ELSE
    RAISE NOTICE 'No global unique constraint on email found — skipping drop.';
  END IF;
END $$;

-- ── Step 2: Drop old single-column index on email if it exists ─────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE  schemaname = 'public'
      AND  tablename  = 'users'
      AND  indexname  = 'IDX_users_email'
  ) THEN
    DROP INDEX public."IDX_users_email";
    RAISE NOTICE 'Dropped old single-column email index.';
  END IF;
END $$;

-- ── Step 3: Create the new per-centre composite partial unique index ───────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE  schemaname = 'public'
      AND  tablename  = 'users'
      AND  indexname  = 'IDX_users_centreId_email'
  ) THEN
    CREATE UNIQUE INDEX "IDX_users_centreId_email"
      ON public.users ("centreId", email)
      WHERE email IS NOT NULL;
    RAISE NOTICE 'Created composite unique index IDX_users_centreId_email.';
  ELSE
    RAISE NOTICE 'Index IDX_users_centreId_email already exists — skipping.';
  END IF;
END $$;

COMMIT;

\echo '✅  Migration v10 complete — email uniqueness is now per-centre.'
