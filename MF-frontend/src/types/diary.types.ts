// src/types/diary.types.ts

export type DiaryTransactionType = "DEPOSIT" | "WITHDRAWAL" | "INTEREST";

export interface DiaryAccount {
  id: string;
  centreId: string;
  customerId: string;
  balance: number;
  /** Unique code assigned by backend (e.g. KCSC-DA00001) */
  accountCode?: string;
  /** Display name for this diary account */
  diaryName?: string;
  cycleStartDate: string | null;
  lastWithdrawalDate: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  customer?: {
    id: string;
    name: string;
    phone: string;
    customerCode: string | null;
  };
}

export interface CreateDiaryAccountDto {
  customerId: string;
  /** Optional display name for the diary account */
  diaryName?: string;
  /** Optional opening balance in INR */
  openingBalance?: number;
}

export interface DiaryTransaction {
  id: string;
  centreId: string;
  accountId: string;
  customerId: string;
  type: DiaryTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionDate: string;
  notes?: string;
  performedBy: string;
  isReversed: boolean;
  reversedBy: string | null;
  reversedAt: string | null;
  createdAt: string;
}

export interface DiaryActionDto {
  amount: number;
  transactionDate: string;
  notes?: string;
}

/**
 * Payload for PATCH /diary/accounts/:accountId/transactions/:txId
 * Only send fields that are being changed. `type` cannot be modified.
 */
export interface EditDiaryTransactionDto {
  amount?: number;
  transactionDate?: string;
  notes?: string;
}

export interface DiarySummary {
  todaysCollection: number;
  monthsCollection: number;
  totalDiaries: number;
  perAgentToday: {
    agentId: string;
    agentName: string;
    amount: number;
  }[];
  // Optional date-specific aggregates
  dateDeposits?: number;
  dateWithdrawals?: number;
  dateNetChange?: number;
  // Current total of all active diary balances
  currentTotalBalance?: number;
}
