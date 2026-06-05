// src/feature/admin/reports/types.ts

export type ReportPeriod = "day" | "week" | "month";

// ── Agent Collections ─────────────────────────────────────────────────────────

export interface AgentCollectionSummary {
  agentId: string;
  agentName: string;
  totalCollected: number;
  emiCount: number;
  penaltyCount: number;
  otherCount: number;
  principalCollected: number;
  interestCollected: number;
  penaltyCollected: number;
  transactions: unknown[];
}

export interface CollectionsReport {
  period: string;
  from: string;
  to: string;
  grandTotal: number;
  totalTransactions: number;
  agents: AgentCollectionSummary[];
}

// ── Agent Day-Wise Breakdown ──────────────────────────────────────────────────

export interface DayWiseEntry {
  date: string;
  txCount: number;
  totalAmount: number;
  principalAmount: number;
  interestAmount: number;
  penaltyAmount: number;
}

export interface AgentDayWiseReport {
  agent: {
    id: string;
    name: string;
    phone: string;
  };
  from: string;
  to: string;
  grandTotal: number;
  totalTransactions: number;
  dayWise: DayWiseEntry[];
}

// ── Centre Summary (Leaderboard) ──────────────────────────────────────────────

export interface CentreSummaryAgent {
  agentId: string;
  agentName: string;
  txCount: number;
  totalCollected: number;
}

export interface CentreSummaryReport {
  period: string;
  from: string;
  to: string;
  grandTotal: number;
  totalTransactions: number;
  byAgent: CentreSummaryAgent[];
}

// ── Combined Transactions ──────────────────────────────────────────────────────

export interface CombinedTransaction {
  id: string;
  source: "loan" | "diary";
  type: string;
  amount: number;
  principalPart: number | null;
  interestPart: number | null;
  penaltyPart: number | null;
  paymentDate: string;
  paymentMode: string | null;
  receiptNo: string | null;
  notes: string | null;
  loanId: string | null;
  loanAccountNumber: string | null;
  diaryId: string | null;
  diaryAccountCode: string | null;
  customerCode?: string | null;
  loanType: string | null;
  customerId: string;
  customerName: string;
  agentId: string | null;
  agentName: string | null;
  createdAt: string;
}

export interface CombinedTransactionsResponse {
  total: number;
  page: number;
  limit: number;
  totalIn: number;
  totalOut: number;
  data: CombinedTransaction[];
}

export interface CombinedTransactionsFilters {
  source?: "loan" | "diary";
  agentId?: string;
  customerId?: string;
  loanId?: string;
  diaryId?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}
