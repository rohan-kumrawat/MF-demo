import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { dashboardService } from "../services/dashboardService";

export function useCentreSummary(period: string = "month") {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  return useQuery({
    queryKey: ["agents-summary", period],
    queryFn: () => dashboardService.getCentreSummary(period),
    enabled: hasHydrated,
  });
}

export function useAgentReport(agentId: string, days: number = 30) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  return useQuery({
    queryKey: ["agent-report", agentId, days],
    queryFn: () => dashboardService.getAgentDayWiseCollections(agentId, days),
    enabled: hasHydrated && !!agentId,
  });
}

export function useCollectionReport(params: {
  from?: string;
  to?: string;
  agentId?: string;
}) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  return useQuery({
    queryKey: ["collection-report", params],
    queryFn: () => dashboardService.getCollectionReport(params),
    enabled: hasHydrated,
  });
}
