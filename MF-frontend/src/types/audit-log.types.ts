// src/types/audit-log.types.ts

export interface AuditLog {
  id: string;
  centreId: string;
  userId: string;
  action: string; // e.g., "CREATE", "UPDATE", "DELETE"
  tableName: string;
  recordId: string;
  oldData?: unknown;
  newData?: unknown;
  ipAddress: string;
  createdAt: string;
}
