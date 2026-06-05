import { apiClient } from "@/lib/axios";

export const dashboardService = {
  getCentreSummary: async (period: string = "month"): Promise<any> => {
    const response = await apiClient.get<any>("/reports/summary", {
      params: { period },
    });
    return response.data;
  },

  getAgentDayWiseCollections: async (
    agentId: string,
    days: number = 30,
  ): Promise<any> => {
    const response = await apiClient.get(
      `/reports/collections/agent/${agentId}/day-wise`,
      { params: { days } },
    );
    return response.data;
  },

  getCollectionReport: async (params: {
    from?: string;
    to?: string;
    agentId?: string;
  }): Promise<any> => {
    const response = await apiClient.get("/loans/report/collections", {
      params,
    });
    return response.data;
  },
};
