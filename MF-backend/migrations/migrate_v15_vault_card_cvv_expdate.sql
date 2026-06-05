-- ============================================================================
-- Vault Cards Migration v15
-- Adds CVV and Exp Date columns to vault_cards
-- ============================================================================

ALTER TABLE vault_cards
  ADD COLUMN IF NOT EXISTS cvv varchar(4) DEFAULT NULL;

ALTER TABLE vault_cards
  ADD COLUMN IF NOT EXISTS "expDate" varchar(50) DEFAULT NULL;
