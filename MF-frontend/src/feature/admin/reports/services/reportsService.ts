// src/feature/admin/reports/services/reportsService.ts
import { apiClient } from "@/lib/axios";
import type {
  CollectionsReport,
  AgentDayWiseReport,
  CentreSummaryReport,
  ReportPeriod,
  CombinedTransactionsFilters,
  CombinedTransactionsResponse,
} from "../types";

const BASE = "/reports";

export const reportsService = {
  getCollections: async (period: ReportPeriod): Promise<CollectionsReport> => {
    const response = await apiClient.get<CollectionsReport>(
      `${BASE}/collections`,
      { params: { period } },
    );
    return response.data;
  },

  getAgentDayWise: async (
    agentId: string,
    days = 30,
  ): Promise<AgentDayWiseReport> => {
    const response = await apiClient.get<AgentDayWiseReport>(
      `${BASE}/collections/agent/${agentId}/day-wise`,
      { params: { days } },
    );
    return response.data;
  },

  getCentreSummary: async (
    period: ReportPeriod,
  ): Promise<CentreSummaryReport> => {
    const response = await apiClient.get<CentreSummaryReport>(
      `${BASE}/summary`,
      { params: { period } },
    );
    return response.data;
  },

  getCombinedTransactions: async (
    filters: CombinedTransactionsFilters = {},
  ): Promise<CombinedTransactionsResponse> => {
    // Remove undefined/empty values before sending as params
    const params: Record<string, string | number> = {};
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== "") params[key] = val;
    }
    const response = await apiClient.get<CombinedTransactionsResponse>(
      `${BASE}/transactions`,
      { params },
    );
    return response.data;
  },

  getTransactionReceipt: async (txId: string, source: "loan" | "diary") => {
    const response = await apiClient.get(
      `${BASE}/transactions/${txId}/receipt`,
      { params: { source } },
    );
    return response.data;
  },
};
