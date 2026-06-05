BEGIN;

-- 1. Update centres
UPDATE centres SET "centreCode" = 'SS' WHERE id = '7e8667c6-d555-4d20-b9b4-241065ef4750';
UPDATE centres SET "centreCode" = 'GK' WHERE id = '1c34dc23-daf4-4b6d-8254-d4a232430721';
UPDATE centres SET "centreCode" = 'DEF' WHERE id NOT IN ('7e8667c6-d555-4d20-b9b4-241065ef4750', '1c34dc23-daf4-4b6d-8254-d4a232430721');

-- 2. Update centre_sequences
UPDATE centre_sequences SET "centreCode" = (SELECT "centreCode" FROM centres WHERE centres.id = centre_sequences."centreId");

-- 3. Update users.customerCode
UPDATE users 
SET "customerCode" = (SELECT "centreCode" FROM centres WHERE centres.id = users."centreId") || substring("customerCode" from position('-' in "customerCode"))
WHERE "customerCode" IS NOT NULL AND position('-' in "customerCode") > 0;

-- 4. Update loans.loanAccountNumber
UPDATE loans 
SET "loanAccountNumber" = (SELECT "centreCode" FROM centres WHERE centres.id = loans."centreId") || substring("loanAccountNumber" from position('-' in "loanAccountNumber"))
WHERE "loanAccountNumber" IS NOT NULL AND position('-' in "loanAccountNumber") > 0;

-- 5. Update loan_transactions.receiptNo
UPDATE loan_transactions 
SET "receiptNo" = (SELECT "centreCode" FROM centres WHERE centres.id = loan_transactions."centreId") || substring("receiptNo" from position('-' in "receiptNo"))
WHERE "receiptNo" IS NOT NULL AND position('-' in "receiptNo") > 0;

-- 6. Update diary_accounts.accountCode
UPDATE diary_accounts 
SET "accountCode" = (SELECT "centreCode" FROM centres WHERE centres.id = diary_accounts."centreId") || substring("accountCode" from position('-' in "accountCode"))
WHERE "accountCode" IS NOT NULL AND position('-' in "accountCode") > 0;

-- 7. Update udhar_persons.personCode
UPDATE udhar_persons 
SET "personCode" = (SELECT "centreCode" FROM centres WHERE centres.id = udhar_persons."centreId") || substring("personCode" from position('-' in "personCode"))
WHERE "personCode" IS NOT NULL AND position('-' in "personCode") > 0;

COMMIT;
