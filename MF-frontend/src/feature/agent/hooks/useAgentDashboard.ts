import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { agentService } from "../services/agentService";
import { diaryService } from "@/services/admin/diary.service";
import type { AgentStats, PendingEmi } from "../types";

function isDueSoon(dueDate: string | null, withinDays: number): boolean {
  if (!dueDate) return false;
  const diff = (new Date(dueDate).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= withinDays;
}

/** Local yyyy-MM-dd without UTC offset issues */
function localDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function useAgentDashboard(agentId: string) {
  // 1. Fetch dashboard stats
  const {
    data: dashboard,
    isLoading: isStatsLoading,
    isError: isStatsError,
  } = useQuery({
    queryKey: ["agentDashboard"],
    queryFn: () => agentService.getDashboard(),
  });

  // 2. Fetch active loans to compute pending EMIs
  const {
    data: activeLoans = [],
    isLoading: isLoansLoading,
    isError: isLoansError,
  } = useQuery({
    queryKey: ["agentLoans", agentId],
    queryFn: () => agentService.getActiveLoans(),
  });

  // Map to view-model: AgentStats
  const dayOfMonth = new Date().getDate();
  const stats: AgentStats = {
    collectedToday: dashboard?.collectedToday ?? 0,
    target: dashboard?.collectedThisMonth || 0,
    progressPct:
      dayOfMonth > 0 && (dashboard?.collectedThisMonth ?? 0) > 0
        ? Math.min(
            100,
            Math.round(
              ((dashboard?.collectedToday ?? 0) /
                ((dashboard?.collectedThisMonth ?? 0) / dayOfMonth)) *
                100,
            ),
          )
        : 0,
    pendingCount: activeLoans.filter((l) => l.overdue > 0).length,
  };

  // Map to view-model: PendingEmi[]
  const pendingEmis: PendingEmi[] = activeLoans
    .filter((l) => l.overdue > 0 || isDueSoon(l.nextEmiDueDate, 3))
    .map((l) => ({
      id: l.id,
      customerId: l.customerId,
      customerName: l.customer?.name ?? "Unknown",
      amount: l.emiAmount ?? l.weeklyInstallment ?? l.dailyInstallment ?? 0,
      status:
        l.overdue > 0
          ? l.overdue > 5000
            ? "high-risk"
            : "overdue"
          : "due-soon",
      daysLabel:
        l.overdue > 0
          ? `₹${l.overdue.toLocaleString("en-IN")} overdue`
          : `Due ${l.nextEmiDueDate}`,
    }));

  // 3. Fetch day-wise trends
  const {
    data: trends,
    isLoading: isTrendsLoading,
    isError: isTrendsError,
  } = useQuery({
    queryKey: ["agentTrends", agentId],
    queryFn: () => agentService.getDayWiseCollections(agentId, 30),
    enabled: !!agentId,
  });

  // 4. Fetch Diary Summary
  const {
    data: diarySummary,
    isLoading: isDiaryLoading,
    isError: isDiaryError,
  } = useQuery({
    queryKey: ["diarySummary"],
    queryFn: () => diaryService.getSummary(),
  });

  // 5. Fetch 30-day combined volume (loan + diary)
  const { fromDate, toDate } = useMemo(() => {
    const now = new Date();
    const to = localDateStr(now);
    const past = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 30,
    );
    const from = localDateStr(past);
    return { fromDate: from, toDate: to };
  }, []);

  const {
    data: combinedVolume,
    isLoading: isCombinedLoading,
    isError: isCombinedError,
  } = useQuery({
    queryKey: ["agentCombinedVolume", agentId, fromDate, toDate],
    queryFn: () =>
      agentService.getCombinedTransactions({
        agentId,
        from: fromDate,
        to: toDate,
        limit: 1,
      }),
    enabled: !!agentId,
  });

  return {
    stats,
    pendingEmis,
    trends,
    diarySummary,
    combinedVolume,
    isLoading:
      isStatsLoading ||
      isLoansLoading ||
      isTrendsLoading ||
      isDiaryLoading ||
      isCombinedLoading,
    isError:
      isStatsError ||
      isLoansError ||
      isTrendsError ||
      isDiaryError ||
      isCombinedError,
  };
}
