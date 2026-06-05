import { useDiarySummary } from "../hooks/useDiary";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Users, Banknote, CalendarDays, Wallet } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DiarySummaryCards() {
  const { data: summary, isLoading, isError } = useDiarySummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-none shadow-sm bg-card rounded-2xl">
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (isError || !summary) {
    return null; // Gracefully fail if no data
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      {/* Today's Collection */}
      <Card className="border-none shadow-sm bg-card rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0 border border-green-500/20">
            <Banknote className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
              Today's Collection
            </p>
            <p className="text-xl font-black text-foreground tracking-tight truncate">
              {formatCurrency(summary.todaysCollection)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Month's Collection */}
      <Card className="border-none shadow-sm bg-card rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0 border border-blue-500/20">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
              Month's Collection
            </p>
            <p className="text-xl font-black text-foreground tracking-tight truncate">
              {formatCurrency(summary.monthsCollection)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total Active Diaries */}
      <Card className="border-none shadow-sm bg-card rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0 border border-purple-500/20">
            <Wallet className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
              Total Diaries
            </p>
            <p className="text-xl font-black text-foreground tracking-tight truncate">
              {summary.totalDiaries}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Agent Breakdown */}
      <Card className="border-none shadow-sm bg-card rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 shrink-0 border border-orange-500/20">
            <Users className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
              Agents Today
            </p>
            <Select>
              <SelectTrigger className="w-full h-7 px-2 py-0 text-xs font-bold bg-muted/30 border-none shadow-none focus:ring-1 focus:ring-primary/20 rounded-md">
                <SelectValue placeholder="View List" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                align="end"
                className="rounded-xl shadow-xl min-w-[220px]"
              >
                {summary.perAgentToday && summary.perAgentToday.length > 0 ? (
                  summary.perAgentToday.map((agent) => (
                    <SelectItem
                      key={agent.agentId}
                      value={agent.agentId}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-semibold text-xs truncate pr-4">
                          {agent.agentName}
                        </span>
                        <span className="font-black text-xs text-primary shrink-0">
                          {formatCurrency(agent.amount)}
                        </span>
                      </div>
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-3 text-xs font-medium text-muted-foreground text-center">
                    No collections today
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
