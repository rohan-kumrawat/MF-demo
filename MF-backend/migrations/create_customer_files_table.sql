-- Migration for creating customer_files table
CREATE TABLE IF NOT EXISTS customer_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  "customerId" UUID NOT NULL,
  "loanId" UUID,
  "centreId" UUID NOT NULL,
  
  "cloudinaryPublicId" VARCHAR(255) NOT NULL UNIQUE,
  "fileUrl" VARCHAR(500) NOT NULL,
  "originalFileName" VARCHAR(255) NOT NULL,
  "mimeType" VARCHAR(100) NOT NULL,
  "fileSize" INTEGER NOT NULL,
  
  "documentType" VARCHAR(50),
  "description" TEXT,
  
  "uploadedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customer_files_customer_id ON customer_files("customerId");
CREATE INDEX IF NOT EXISTS idx_customer_files_loan_id ON customer_files("loanId");
CREATE INDEX IF NOT EXISTS idx_customer_files_centre_customer ON customer_files("centreId", "customerId");
CREATE INDEX IF NOT EXISTS idx_customer_files_centre_customer_loan ON customer_files("centreId", "customerId", "loanId");
CREATE INDEX IF NOT EXISTS idx_customer_files_uploaded_at ON customer_files("uploadedAt");
