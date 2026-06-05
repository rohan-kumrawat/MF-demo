// src/feature/admin/agents/types.ts

export type UserRole = "admin" | "agent" | "customer" | "kiosk";

export interface Agent {
  id: string;
  username: string;
  role: "agent";
  name: string;
  phone: string;
  address?: string;
  createdAt: string;
  updatedAt?: string;

  // Extended properties for the UI (may be derived or from stats API)
  area?: string;
  customerCount?: number;
  todayCollection?: number;
  target?: number;
  monthlyCollected?: number;
  monthlyTarget?: number;
  defaulters?: number;
}

export interface CreateAgentDto {
  username: string;
  password?: string;
  role: "agent";
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateAgentDto {
  name?: string;
  phone?: string;
  address?: string;
  password?: string;
}

export interface AgentFilters {
  search?: string;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  txCount: number;
  totalCollected: number;
}

export interface ApiCentreSummary {
  period: string;
  from: string;
  to: string;
  grandTotal: number;
  totalTransactions: number;
  byAgent: AgentPerformance[];
}
