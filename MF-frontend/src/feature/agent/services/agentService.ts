import { apiClient } from "../../../lib/axios";
import type {
  ApiLoan,
  ApiDashboard,
  ApiCollectionReport,
  ApiTransaction,
  CreateTransactionDto,
  CustomerLoanSummary,
  ApiAgentDayWiseCollections,
  ApiDiaryAccount,
} from "../types";
import type { PaginatedResponse } from "@/types/user.types";
import { localToday } from "@/lib/utils";

const LOANS = "/loans";
const USERS = "/users";
const DIARY = "/diary/accounts";

export const agentService = {
  // Get customers for the agent's center
  getCustomers: async (params?: { name?: string }) => {
    const res = await apiClient.get<PaginatedResponse<any>>(USERS, {
      params: { role: "customer", ...params },
    });
    return res.data.data;
  },

  // Get diary accounts (contains balance and customerId)
  getDiaryAccounts: async () => {
    const res = await apiClient.get<any[]>(DIARY);
    return res.data;
  },

  // Get diary accounts for a specific customer
  getCustomerDiaryAccounts: async (
    customerId: string,
  ): Promise<ApiDiaryAccount[]> => {
    const res = await apiClient.get<ApiDiaryAccount[]>(
      `/diary/customers/${customerId}/accounts`,
    );
    return res.data;
  },

  // Get transactions for a specific diary account
  getDiaryTransactions: async (accountId: string) => {
    const res = await apiClient.get<any[]>(
      `${DIARY}/${accountId}/transactions`,
    );
    return res.data;
  },

  // Submit a diary deposit
  submitDiaryDeposit: async (
    accountId: string,
    amount: number,
    notes?: string,
    idempotencyKey?: string,
  ) => {
    const config = idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined;
    const res = await apiClient.post(
      `${DIARY}/${accountId}/deposit`,
      {
        amount,
        transactionDate: localToday(),
        notes,
      },
      config,
    );
    return res.data;
  },

  // Dashboard stats (admin-level endpoint, backend applies centre isolation)
  getDashboard: async (): Promise<ApiDashboard> => {
    const res = await apiClient.get<ApiDashboard>(`${LOANS}/dashboard`);
    return res.data;
  },

  // All active loans — used by AgentCollect for full list display
  getActiveLoans: async (): Promise<ApiLoan[]> => {
    const res = await apiClient.get<ApiLoan[]>(LOANS, {
      params: { status: "active" },
    });
    return res.data;
  },

  // Loan summary for a specific customer (agent viewing a customer's loan details)
  getCustomerLoanSummary: async (
    customerId: string,
  ): Promise<CustomerLoanSummary> => {
    const res = await apiClient.get<CustomerLoanSummary>(
      `${LOANS}/customers/${customerId}/summary`,
    );
    return res.data;
  },

  // Collection history report filtered by agent + date range
  getCollectionReport: async (
    agentId: string,
    from: string,
    to: string,
  ): Promise<ApiCollectionReport> => {
    const res = await apiClient.get<ApiCollectionReport>(
      `${LOANS}/report/collections`,
      {
        params: { agentId, from, to },
      },
    );
    return res.data;
  },

  // Submit a loan transaction (EMI collection)
  submitTransaction: async (
    loanId: string,
    dto: CreateTransactionDto,
    idempotencyKey?: string,
  ): Promise<ApiTransaction> => {
    const config = idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined;
    const res = await apiClient.post<ApiTransaction>(
      `${LOANS}/${loanId}/transactions`,
      dto,
      config,
    );
    return res.data;
  },

  // Day-wise collection breakdown for a specific agent
  getDayWiseCollections: async (
    agentId: string,
    days: number = 30,
  ): Promise<ApiAgentDayWiseCollections> => {
    const res = await apiClient.get<ApiAgentDayWiseCollections>(
      `/reports/collections/agent/${agentId}/day-wise`,
      { params: { days } },
    );
    return res.data;
  },

  // Get combined loan + diary transactions for calculating total volume
  getCombinedTransactions: async (params: {
    agentId?: string;
    from?: string;
    to?: string;
    limit?: number;
  }) => {
    const res = await apiClient.get(`/reports/transactions`, { params });
    return res.data;
  },
};
