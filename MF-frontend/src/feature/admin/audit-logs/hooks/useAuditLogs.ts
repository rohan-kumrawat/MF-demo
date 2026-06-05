import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditLogService";
import { type AuditLog } from "../types";

export function useAuditLogs() {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-logs"],
    queryFn: () => auditLogService.getAll(),
  });
}
