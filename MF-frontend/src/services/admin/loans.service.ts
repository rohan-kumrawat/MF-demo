import { apiClient } from "@/lib/axios";
import type {
  Loan,
  CreateLoanDto,
  LoanFilters,
  DashboardStats,
  CollectionReport,
  CustomerLoanSummary,
  ScheduleItem,
  Transaction,
  CreateTransactionDto,
  EditTransactionDto,
} from "@/types/loan.types";

const BASE = "/loans";

export const loansService = {
  getAll: async (params?: LoanFilters) => {
    const response = await apiClient.get<Loan[]>(BASE, { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Loan>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (dto: CreateLoanDto) => {
    const response = await apiClient.post<Loan>(BASE, dto);
    return response.data;
  },

  update: async (
    id: string,
    dto: import("@/types/loan.types").UpdateLoanDto,
  ) => {
    const response = await apiClient.patch<Loan>(`${BASE}/${id}`, dto);
    return response.data;
  },

  getDashboard: async () => {
    const response = await apiClient.get<DashboardStats>(`${BASE}/dashboard`);
    return response.data;
  },

  getCollectionReport: async (params?: {
    from?: string;
    to?: string;
    agentId?: string;
  }) => {
    const response = await apiClient.get<CollectionReport>(
      `${BASE}/report/collections`,
      { params },
    );
    return response.data;
  },

  getCustomerSummary: async (customerId: string) => {
    const response = await apiClient.get<CustomerLoanSummary>(
      `${BASE}/customers/${customerId}/summary`,
    );
    return response.data;
  },

  getSchedule: async (id: string) => {
    const response = await apiClient.get<ScheduleItem[]>(
      `${BASE}/${id}/schedule`,
    );
    return response.data;
  },

  getTransactions: async (id: string) => {
    const response = await apiClient.get<Transaction[]>(
      `${BASE}/${id}/transactions`,
    );
    return response.data;
  },

  addTransaction: async (
    id: string,
    dto: CreateTransactionDto,
    idempotencyKey?: string,
  ) => {
    const config = idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined;
    const response = await apiClient.post<Transaction>(
      `${BASE}/${id}/transactions`,
      dto,
      config,
    );
    return response.data;
  },

  preClose: async (id: string, notes: string) => {
    const response = await apiClient.post<Loan>(`${BASE}/${id}/pre-close`, {
      notes,
    });
    return response.data;
  },

  reverseTransaction: async (loanId: string, txId: string, notes: string) => {
    const response = await apiClient.patch<Transaction>(
      `${BASE}/${loanId}/transactions/${txId}/reverse`,
      {
        notes,
      },
    );
    return response.data;
  },

  /**
   * ADMIN ONLY — Edit an existing loan transaction.
   * `type` cannot be changed. Only send fields that are being modified.
   */
  editTransaction: async (
    loanId: string,
    txId: string,
    dto: EditTransactionDto,
  ) => {
    const response = await apiClient.patch<Transaction>(
      `${BASE}/${loanId}/transactions/${txId}`,
      dto,
    );
    return response.data;
  },

  /**
   * ADMIN ONLY — Permanently delete a loan transaction.
   * Backend will auto-recalculate loan balances after deletion.
   */
  deleteTransaction: async (loanId: string, txId: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `${BASE}/${loanId}/transactions/${txId}`,
    );
    return response.data;
  },

  renewBullet: async (
    id: string,
    dto: {
      paymentDate: string;
      paymentMode: string;
      notes?: string;
      diaryAmount?: number;
      diaryAccountId?: string;
    },
  ) => {
    const response = await apiClient.post<Transaction>(
      `${BASE}/${id}/renew-bullet`,
      dto,
    );
    return response.data;
  },

  applyBulletPenalty: async (id: string, dto: { notes?: string }) => {
    const response = await apiClient.post<Loan>(
      `${BASE}/${id}/apply-bullet-penalty`,
      dto,
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `${BASE}/${id}`,
    );
    return response.data;
  },
};
