// src/feature/admin/reports/pages/ReportsPage.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  IndianRupee,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { formatDisplayDate } from "@/lib/utils";
import {
  useCollectionsReport,
  useCentreSummary,
  useAgentDayWise,
} from "../hooks/useReports";
import type { ReportPeriod } from "../types";

// ── Period Selector ────────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { label: string; value: ReportPeriod }[] = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
];

interface PeriodSelectorProps {
  value: ReportPeriod;
  onChange: (p: ReportPeriod) => void;
}

function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-2">
      {PERIOD_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(opt.value)}
        >
          <Calendar className="h-3.5 w-3.5 mr-1.5" />
          {opt.label}
        </Button>
      ))}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, icon, isLoading }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="rounded-lg p-2.5 bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-6 w-24 mt-1" />
          ) : (
            <p className="text-xl font-semibold">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Collections Tab ────────────────────────────────────────────────────────────

function CollectionsTab({
  period,
  onAgentDrillDown,
}: {
  period: ReportPeriod;
  onAgentDrillDown: (agentId: string) => void;
}) {
  const { data, isLoading, isError } = useCollectionsReport(period);

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Report load karne mein dikkat aayi. Dobara try karo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard
          title="Grand Total"
          value={
            isLoading
              ? "—"
              : `₹${Number(data?.grandTotal ?? 0).toLocaleString("en-IN")}`
          }
          icon={<IndianRupee className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Transactions"
          value={isLoading ? "—" : (data?.totalTransactions ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Active Agents"
          value={isLoading ? "—" : (data?.agents?.length ?? 0)}
          icon={<Users className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* Agent breakdown table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Agent-wise Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Perform By</TableHead>
                  <TableHead className="text-right">Collected</TableHead>
                  <TableHead className="text-right">EMIs</TableHead>
                  <TableHead className="text-right">Penalties</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                {!isLoading && (data?.agents ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground py-8"
                    >
                      Is period mein koi collection nahi mili.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  (data?.agents ?? []).map((agent) => (
                    <TableRow key={agent.agentId} className="hover:bg-muted/30">
                      <TableCell className="font-medium">
                        {agent.agentName}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{Number(agent.totalCollected).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">{agent.emiCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{agent.penaltyCount}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₹
                        {Number(agent.principalCollected).toLocaleString(
                          "en-IN",
                        )}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₹
                        {Number(agent.interestCollected).toLocaleString(
                          "en-IN",
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAgentDrillDown(agent.agentId)}
                        >
                          Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Summary (Leaderboard) Tab ──────────────────────────────────────────────────

function SummaryTab({ period }: { period: ReportPeriod }) {
  const { data, isLoading, isError } = useCentreSummary(period);

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Summary load karne mein dikkat aayi. Dobara try karo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="Centre Grand Total"
          value={
            isLoading
              ? "—"
              : `₹${Number(data?.grandTotal ?? 0).toLocaleString("en-IN")}`
          }
          icon={<IndianRupee className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Transactions"
          value={isLoading ? "—" : (data?.totalTransactions ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            🏆 Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Perform By</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Total Collected</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 4 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                {!isLoading && (data?.byAgent ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center text-muted-foreground py-8"
                    >
                      Is period mein koi data nahi.
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading &&
                  (data?.byAgent ?? []).map((agent, idx) => (
                    <TableRow key={agent.agentId}>
                      <TableCell className="font-bold text-muted-foreground">
                        {idx === 0
                          ? "🥇"
                          : idx === 1
                            ? "🥈"
                            : idx === 2
                              ? "🥉"
                              : idx + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {agent.agentName}
                      </TableCell>
                      <TableCell className="text-right">
                        {agent.txCount}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{Number(agent.totalCollected).toLocaleString("en-IN")}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Agent Day-Wise Drill-down ──────────────────────────────────────────────────

function AgentDayWisePanel({
  agentId,
  onBack,
}: {
  agentId: string;
  onBack: () => void;
}) {
  const { data, isLoading, isError } = useAgentDayWise(agentId, 30);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back
        </Button>
        {!isLoading && data && (
          <div>
            <p className="font-semibold">{data.agent.name}</p>
            <p className="text-xs text-muted-foreground">{data.agent.phone}</p>
          </div>
        )}
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>
            Agent data load karne mein dikkat aayi.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          title="30-Day Total"
          value={
            isLoading
              ? "—"
              : `₹${Number(data?.grandTotal ?? 0).toLocaleString("en-IN")}`
          }
          icon={<IndianRupee className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Transactions"
          value={isLoading ? "—" : (data?.totalTransactions ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Day-wise Breakdown (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Transactions</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Penalty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 6 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                {!isLoading &&
                  (data?.dayWise ?? []).map((day) => (
                    <TableRow key={day.date}>
                      <TableCell className="font-medium">
                        {formatDisplayDate(day.date)}
                      </TableCell>
                      <TableCell className="text-right">
                        {day.txCount}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        ₹{Number(day.totalAmount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₹{Number(day.principalAmount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ₹{Number(day.interestAmount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="text-right text-red-500">
                        {day.penaltyAmount > 0
                          ? `₹${Number(day.penaltyAmount).toLocaleString("en-IN")}`
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Page Orchestrator ──────────────────────────────────────────────────────────

export default function ReportsPage() {
  const [period, setPeriod] = useState<ReportPeriod>("day");
  const [drillDownAgentId, setDrillDownAgentId] = useState<string | null>(null);

  // If drilling down into an agent, show the day-wise panel instead
  if (drillDownAgentId) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <AgentDayWisePanel
          agentId={drillDownAgentId}
          onBack={() => setDrillDownAgentId(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Reports</h1>
        </div>
        <PeriodSelector value={period} onChange={setPeriod} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="collections">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="summary">Centre Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="mt-4">
          <CollectionsTab
            period={period}
            onAgentDrillDown={setDrillDownAgentId}
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-4">
          <SummaryTab period={period} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
