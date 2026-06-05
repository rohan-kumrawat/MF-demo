export enum LoanTransactionType {
  EMI          = 'emi',          // Regular monthly instalment
  FULL_PAYMENT = 'full_payment', // Pay entire remaining balance at once
  PENALTY      = 'penalty',      // Late fee / penalty charge
  RENEWAL      = 'renewal',      // Bullet loan renewal interest payment
  OTHER        = 'other',        // Misc credit / advance payment
}
