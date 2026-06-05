// src/services/admin/audit-logs.service.ts
import { apiClient } from "@/lib/axios";
import type { AuditLog } from "@/types/audit-log.types";

const BASE = "/audit-logs";

export const auditLogsService = {
  getAll: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get<AuditLog[]>(BASE, { params });
    return response.data;
  },
};
