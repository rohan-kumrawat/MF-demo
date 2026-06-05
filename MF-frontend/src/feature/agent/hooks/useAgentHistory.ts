import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { localDateStr } from "@/lib/utils";
import { agentService } from "../services/agentService";
import type { DateFilter } from "../types";

function getDateRange(filter: DateFilter): { from: string; to: string } {
  const today = new Date();
  const fmt = (d: Date) => localDateStr(d);
  if (filter === "today") return { from: fmt(today), to: fmt(today) };
  if (filter === "week") {
    const week = new Date(today);
    week.setDate(today.getDate() - 7);
    return { from: fmt(week), to: fmt(today) };
  }
  // 'all' — use a far-back date
  return { from: "2020-01-01", to: fmt(today) };
}

export function useAgentHistory(agentId: string) {
  const [dateFilter, setDateFilter] = useState<DateFilter>("today");
  const { from, to } = getDateRange(dateFilter);

  const { data: report, isLoading } = useQuery({
    queryKey: ["agentHistory", agentId, dateFilter],
    queryFn: () => agentService.getCollectionReport(agentId, from, to),
  });

  return {
    report,
    totalFiltered: report?.totalCollected ?? 0,
    dateFilter,
    setDateFilter,
    isLoading,
  };
}
