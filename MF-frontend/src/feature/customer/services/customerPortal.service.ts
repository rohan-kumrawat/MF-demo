// src/feature/customer/services/customerPortal.service.ts
import { apiClient } from "@/lib/axios";
import type {
  CustomerLoanSummary,
  DiaryAccount,
  DiaryTransaction,
  ScheduleItem,
} from "../types";

const customerPortalService = {
  getLoanSummary: async (customerId: string): Promise<CustomerLoanSummary> => {
    const response = await apiClient.get<CustomerLoanSummary>(
      `/loans/customers/${customerId}/summary`,
    );
    return response.data;
  },

  getDiaryAccounts: async (): Promise<DiaryAccount[]> => {
    const response = await apiClient.get<DiaryAccount[]>("/diary/accounts");
    return response.data;
  },

  getDiaryAccount: async (accountId: string): Promise<DiaryAccount> => {
    const response = await apiClient.get<DiaryAccount>(
      `/diary/accounts/${accountId}`,
    );
    return response.data;
  },

  getDiaryTransactions: async (
    accountId: string,
  ): Promise<DiaryTransaction[]> => {
    const response = await apiClient.get<DiaryTransaction[]>(
      `/diary/accounts/${accountId}/transactions`,
    );
    return response.data;
  },

  getLoanSchedule: async (loanId: string): Promise<ScheduleItem[]> => {
    const response = await apiClient.get<ScheduleItem[]>(
      `/loans/${loanId}/schedule`,
    );
    return response.data;
  },
};

export default customerPortalService;
