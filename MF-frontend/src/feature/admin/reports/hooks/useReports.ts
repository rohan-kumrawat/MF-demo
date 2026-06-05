// src/feature/admin/reports/hooks/useReports.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { reportsService } from "../services/reportsService";
import type { ReportPeriod, CombinedTransactionsFilters } from "../types";

const QUERY_KEYS = {
  collections: (period: ReportPeriod) =>
    ["reports", "collections", period] as const,
  agentDayWise: (agentId: string, days: number) =>
    ["reports", "agent-day-wise", agentId, days] as const,
  centreSummary: (period: ReportPeriod) =>
    ["reports", "summary", period] as const,
  combinedTransactions: (filters: CombinedTransactionsFilters) =>
    ["reports", "transactions", filters] as const,
};

export function useCollectionsReport(period: ReportPeriod) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: QUERY_KEYS.collections(period),
    queryFn: () => reportsService.getCollections(period),
    enabled: hasHydrated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAgentDayWise(agentId: string | null, days = 30) {
  return useQuery({
    queryKey: QUERY_KEYS.agentDayWise(agentId ?? "", days),
    queryFn: () => reportsService.getAgentDayWise(agentId!, days),
    enabled: !!agentId,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCentreSummary(period: ReportPeriod) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: QUERY_KEYS.centreSummary(period),
    queryFn: () => reportsService.getCentreSummary(period),
    enabled: hasHydrated,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Fetches combined loan + diary transactions with multi-filter support.
 * Re-fetches automatically when filters change.
 */
export function useCombinedTransactions(filters: CombinedTransactionsFilters) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: QUERY_KEYS.combinedTransactions(filters),
    queryFn: () => reportsService.getCombinedTransactions(filters),
    enabled: hasHydrated,
    staleTime: 1000 * 60 * 1, // 1 min — live transaction data
    placeholderData: (prev) => prev, // keep showing old data while refetching
  });
}
