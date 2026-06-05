-- ═══════════════════════════════════════════════════════════════════════════════
-- Migration v11  ·  S-10 + S-4  ·  Refresh Token Indexes & Files centreId Index
-- ═══════════════════════════════════════════════════════════════════════════════
-- Changes:
--   S-10: Add composite index (user_id, centre_id) on refresh_tokens for fast
--         per-user, per-centre token lookups — eliminates residual full-table
--         risk after the C-4 O(n) scan fix.
--
--   S-4:  Add index on customer_files.centre_id for fast centre-scoped queries
--         (all file endpoints now enforce centreId in WHERE clauses).
--
-- Run on AWS Lightsail:
--   PGPASSWORD='<password>' psql -h localhost -U postgres -d microfinance \
--     -f ~/microfinance-backend/migrations/migrate_v11.sql
--
-- Safe to re-run: all statements are idempotent (IF NOT EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── S-10: Composite index on refresh_tokens (userId, centreId) ────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE  schemaname = 'public'
      AND  tablename  = 'refresh_tokens'
      AND  indexname  = 'IDX_refresh_tokens_userId_centreId'
  ) THEN
    CREATE INDEX "IDX_refresh_tokens_userId_centreId"
      ON public.refresh_tokens ("userId", "centreId");
    RAISE NOTICE 'Created index IDX_refresh_tokens_userId_centreId.';
  ELSE
    RAISE NOTICE 'Index IDX_refresh_tokens_userId_centreId already exists — skipping.';
  END IF;
END $$;

-- ── S-4: Index on customer_files.centreId for fast centre-scoped lookups ──────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE  schemaname = 'public'
      AND  tablename  = 'customer_files'
      AND  indexname  = 'IDX_customer_files_centreId'
  ) THEN
    CREATE INDEX "IDX_customer_files_centreId"
      ON public.customer_files ("centreId");
    RAISE NOTICE 'Created index IDX_customer_files_centreId.';
  ELSE
    RAISE NOTICE 'Index IDX_customer_files_centreId already exists — skipping.';
  END IF;
END $$;

COMMIT;

\echo '✅  Migration v11 complete — refresh_tokens and customer_files indexes added.'
