// src/types/loan.types.ts

export type LoanType = "emi" | "bullet" | "flexible" | "weekly";
export type LoanStatus = "active" | "closed" | "pre_closed";
export type PaymentMode = "cash" | "upi" | "bank";
export type TransactionType = "emi" | "full_payment" | "penalty" | "other";

export interface FamilyMember {
  name: string;
  relation: string;
  phone: string;
  aadharNumber?: string;
}

export interface Guarantor {
  customerId?: string;
  name: string;
  phone: string;
  relation: string;
  aadharNumber?: string;
  address: string;
}

/** Embedded summary returned by the enriched /loans API */
export interface LoanCustomerSummary {
  id: string;
  name: string;
  phone: string;
}

export interface LoanAgentSummary {
  id: string;
  name: string;
}

export interface GuaranteedLoanSummary {
  id: string;
  loanAccountNumber: string;
  loanType: LoanType;
  status: LoanStatus;
  principalAmount: string | number;
  totalPayable: string | number;
  remainingBalance: string | number;
  startDate: string;
  endDate?: string | null;
  createdAt?: string;
  customerId: string;
  customer?: LoanCustomerSummary | null;
  guarantorMatch?: {
    customerId?: string;
    name: string;
    phone: string;
    relation: string;
    aadharNumber?: string;
    address: string;
  } | null;
}

export interface Loan {
  id: string;
  loanAccountNumber: string;
  customerId: string;
  agentId?: string;
  /** Embedded from the enriched API response */
  customer?: LoanCustomerSummary;
  agent?: LoanAgentSummary;
  loanType: LoanType;
  principalAmount: string | number;
  interestRate: string | number;
  tenureMonths: number;
  fileCharge: string | number;
  otherCharge: string | number;
  disbursedAmount: string | number;
  totalPayable: string | number;
  emiAmount: string | number;
  dailyInstallment?: number | null;
  weeklyInstallment?: number | null;
  totalDays?: number | null;
  totalWeeks?: number | null;
  startDate: string;
  endDate: string;
  emiPaymentMode: PaymentMode;
  purposeOfLoan?: string;
  guarantors: Guarantor[];
  familyMembers?: FamilyMember[];
  fatherOrHusbandName?: string;
  aadharNumber?: string;
  accountNumber?: string;
  hasPreviousLoan?: boolean;
  previousLoanAmount?: number;
  previousLoanStatus?: string;
  totalPaid: string | number;
  remainingBalance: string | number;
  status: LoanStatus;
  overdue?: number;
  totalEmis?: number;
  emisPaid?: number;
  emisRemaining?: number;
  nextEmiDueDate?: string | null;
  notes?: string;
  createdAt?: string;
}

export interface CreateLoanDto {
  customerId: string;
  loanType: LoanType;
  principalAmount: number;
  interestRate: number;
  tenureMonths: number;
  fileCharge?: number;
  otherCharge?: number;
  totalPayable: number;
  emiAmount?: number;
  dailyInstallment?: number;
  totalDays?: number;
  weeklyInstallment?: number;
  totalWeeks?: number;
  startDate: string;
  endDate?: string;
  purposeOfLoan?: string;
  emiPaymentMode?: PaymentMode;
  guarantors?: Guarantor[];
  familyMembers?: FamilyMember[];
  fatherOrHusbandName?: string;
  aadharNumber?: string;
  accountNumber?: string;
  hasPreviousLoan: boolean;
  previousLoanAmount?: number;
  previousLoanStatus?: string;
  notes?: string;
}

export type UpdateLoanDto = Partial<
  Omit<CreateLoanDto, "loanType" | "customerId">
>;

export interface LoanFilters {
  status?: LoanStatus;
  overdue?: boolean;
  from?: string;
  to?: string;
  search?: string;
  customerId?: string;
  agentId?: string;
}

export interface DashboardStats {
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  preClosedLoans: number;
  overdueLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalOverdueAmount: number;
  collectedToday: number;
  collectedThisMonth: number;
  transactionsToday: number;
}

export interface CollectionReport {
  period: { from: string; to: string };
  totalCollected: number;
  totalTransactions: number;
  byAgent: Array<{
    agentId: string;
    agentName: string;
    totalAmount: number;
    emiCount: number;
    penaltyCount: number;
    otherCount: number;
  }>;
}

export interface CustomerLoanSummary {
  customerId: string;
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  preClosedLoans?: number;
  totalDisbursed: number;
  totalPayable: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  loans: Loan[];
  guaranteedLoans?: GuaranteedLoanSummary[];
  guaranteedLoansCount?: number;
  totalGuaranteedPrincipal?: number;
}

export interface ScheduleItem {
  emiNumber?: number;
  installmentNumber?: number;
  dayNumber?: number;
  dueDate?: string | null;
  expectedAmount: number;
  breakup?: { principal: number; interest: number };
  status: "paid" | "partial" | "pending" | "overdue";
  paidAmount?: number;
  paidDate?: string | null;
  receiptNo?: string | null;
  totalPaid?: number;
  remainingBalance?: number;
  transactionCount?: number;
}

export interface Transaction {
  id: string;
  loanId: string;
  type: TransactionType;
  amount: string | number;
  principalPart: string | number;
  interestPart: string | number;
  penaltyPart: string | number;
  paymentMode: PaymentMode;
  receiptNo: string;
  paymentDate: string;
  collectedBy: string;
  isReversed: boolean;
  diaryAmount?: string | number;
  diaryAccountId?: string;
  createdAt: string;
}

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  paymentMode: PaymentMode;
  paymentDate: string;
  notes?: string;
  diaryAmount?: number;
  diaryAccountId?: string;
}

/**
 * Payload for PATCH /loans/:loanId/transactions/:txId (ADMIN only).
 * `type` is excluded — backend does not allow changing transaction type.
 * Only include fields that are being changed.
 */
export interface EditTransactionDto {
  amount?: number;
  paymentDate?: string;
  paymentMode?: PaymentMode;
  notes?: string;
}
