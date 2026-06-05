// src/feature/agent/types.ts

// --- Raw API Shapes (from backend) ---

export interface ApiLoan {
  id: string;
  loanAccountNumber: string;
  customerId: string;
  agentId: string;
  loanType: "emi" | "bullet" | "flexible" | "weekly";
  emiAmount: number | null;
  dailyInstallment: number | null;
  weeklyInstallment: number | null;
  status: "active" | "closed" | "pre_closed";
  totalPaid: number;
  remainingBalance: number;
  overdue: number; // computed by backend
  totalEmis: number | null;
  emisPaid: number | null;
  emisRemaining: number | null;
  nextEmiDueDate: string | null; // "YYYY-MM-DD"
  startDate: string;
  endDate: string;
  customer?: ApiCustomerSummary;
}

export interface ApiCustomerSummary {
  id: string;
  name: string;
  phone: string;
  customerCode: string | null;
  address: string | null;
}

export interface ApiDashboard {
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  overdueLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  totalOverdueAmount: number;
  collectedToday: number;
  collectedThisMonth: number;
  transactionsToday: number;
}

export interface ApiCollectionReport {
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

export interface ApiTransaction {
  id: string;
  loanId: string;
  customerId: string;
  type: "emi" | "penalty" | "other";
  amount: number;
  principalPart?: number;
  interestPart?: number;
  penaltyPart?: number;
  diaryAmount?: number;
  paymentMode: string;
  receiptNo: string;
  paymentDate: string;
  collectedBy: string;
  notes: string | null;
  isReversed: boolean;
  createdAt: string;
}

// DTO for submitting a collection
export interface CreateTransactionDto {
  type: "emi" | "penalty" | "other";
  amount: number;
  paymentMode: "cash" | "upi" | "cheque";
  paymentDate: string; // "YYYY-MM-DD"
  notes?: string;
  diaryAmount?: number;
  diaryAccountId?: string;
}

/** Shape returned by GET /loans/customers/:id/summary */
export interface LoanSummaryItem {
  id: string;
  loanAccountNumber: string;
  loanType: "emi" | "bullet" | "flexible" | "weekly";
  status: "active" | "closed" | "pre_closed";
  principalAmount: number;
  remainingBalance: number;
  overdue: number;
  emiAmount?: number | null;
  dailyInstallment?: number | null;
  weeklyInstallment?: number | null;
  totalEmis: number | null;
  emisPaid: number | null;
  emisRemaining: number | null;
  nextEmiDueDate: string | null;
}

export interface CustomerLoanSummary {
  customerId: string;
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  totalDisbursed: number;
  totalPayable: number;
  totalPaid: number;
  totalOutstanding: number;
  totalOverdue: number;
  loans: LoanSummaryItem[];
}

export interface ApiDiaryAccount {
  id: string;
  centreId: string;
  customerId: string;
  diaryName: string;
  balance: string; // string from API, parse with parseFloat()
  cycleStartDate: string;
  lastWithdrawalDate: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// --- View-Model Types (used by components and hooks) ---

export type DateFilter = "today" | "week" | "all";

export interface AgentCustomer {
  id: string;
  loanId: string; // primary / first active loan (used for display in cards)
  loans: ApiLoan[]; // all active loans for multi-loan selection
  name: string;
  phone: string;
  accountNo: string;
  emi: number | null;
  emiStatus: "green" | "yellow" | "orange" | "red";
  emiLabel: string;
  diaryBalance: number;
  diaryAccountId?: string;
  diaryName?: string;
  risk: "Low" | "Medium" | "High";
}

export interface PendingEmi {
  id: string; // customerId
  customerId: string;
  customerName: string;
  amount: number;
  status: "due-soon" | "overdue" | "high-risk";
  daysLabel: string; // e.g. "Due in 2 days", "8 days overdue"
}

export interface CollectionRecord {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  mode: "Cash" | "UPI" | "Cheque";
  usedDiary: boolean;
  receiptNo: string;
  date: string; // ISO 'YYYY-MM-DD'
  agentId: string;
}

export interface AgentStats {
  collectedToday: number;
  target: number;
  progressPct: number;
  pendingCount: number;
}

export interface DayWiseRecord {
  date: string;
  txCount: number;
  totalAmount: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
}

export interface ApiAgentDayWiseCollections {
  agent: { id: string; name: string; phone: string };
  from: string;
  to: string;
  grandTotal: number;
  totalTransactions: number;
  dayWise: DayWiseRecord[];
}
