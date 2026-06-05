-- ============================================================================
-- Vault Module Migration — Run on production DB
-- Creates vault_cards + vault_credentials tables, adds vaultPin to users
-- ============================================================================

-- 1. Add vaultPin column to users (for PIN-based vault access)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "vaultPin" varchar(100) DEFAULT NULL;

-- 2. Create vault_cards table
CREATE TABLE IF NOT EXISTS vault_cards (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "centreId"      uuid NOT NULL REFERENCES centres(id),
  "adminId"       uuid NOT NULL REFERENCES users(id),
  "bankName"      varchar(100) NOT NULL,
  "cardNumber"    varchar(100) NOT NULL,
  "billGenerateDate" varchar(50) DEFAULT NULL,
  "dueDate"       varchar(50) DEFAULT NULL,
  "billAmount"    decimal(12,2) DEFAULT NULL,
  remarks         text DEFAULT NULL,
  "createdAt"     timestamp NOT NULL DEFAULT now(),
  "updatedAt"     timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_vault_cards_centre_admin"
  ON vault_cards ("centreId", "adminId");

-- 3. Create vault_credentials table
CREATE TABLE IF NOT EXISTS vault_credentials (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "centreId"            uuid NOT NULL REFERENCES centres(id),
  "adminId"             uuid NOT NULL REFERENCES users(id),
  "companyName"         varchar(100) NOT NULL,
  "loginId"             varchar(100) DEFAULT NULL,
  password              varchar(255) DEFAULT NULL,
  "pinNumber"           varchar(50) DEFAULT NULL,
  "loginPassword"       varchar(255) DEFAULT NULL,
  "transactionPassword" varchar(255) DEFAULT NULL,
  remarks               text DEFAULT NULL,
  "createdAt"           timestamp NOT NULL DEFAULT now(),
  "updatedAt"           timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "IDX_vault_credentials_centre_admin"
  ON vault_credentials ("centreId", "adminId");
