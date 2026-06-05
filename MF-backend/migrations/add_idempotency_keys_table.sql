-- Idempotency keys table
-- Stores request fingerprints so duplicate payment requests return the same
-- cached response instead of creating a second transaction.
-- Keys expire after 24 hours and should be cleaned up periodically.

CREATE TABLE IF NOT EXISTS idempotency_keys (
  id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  "key"         VARCHAR(255) NOT NULL,
  user_id       UUID         NOT NULL,
  centre_id     UUID         NOT NULL,
  endpoint      VARCHAR(100) NOT NULL,
  response_body JSONB        NOT NULL,
  expires_at    TIMESTAMP    NOT NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),

  -- Same key from same centre on same endpoint is always a duplicate
  CONSTRAINT uq_idempotency_key UNIQUE ("key", centre_id, endpoint)
);

CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires ON idempotency_keys(expires_at);
