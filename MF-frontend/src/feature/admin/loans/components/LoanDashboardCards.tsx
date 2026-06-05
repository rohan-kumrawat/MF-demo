// src/feature/admin/loans/components/LoanDashboardCards.tsx
import React from "react";
import {
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Wallet,
  Users,
  Activity,
} from "lucide-react";
import type { DashboardStats } from "../types";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface Props {
  stats: DashboardStats;
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent?: "blue" | "red" | "green" | "amber" | "purple";
}

function StatCard({ label, value, icon, accent = "blue" }: StatCardProps) {
  const accentMap = {
    blue: "bg-cyan-500/10 text-cyan-700 border-cyan-200",
    red: "bg-rose-500/10 text-rose-700 border-rose-200",
    green: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    amber: "bg-amber-500/10 text-amber-700 border-amber-200",
    purple: "bg-violet-500/10 text-violet-700 border-violet-200",
  };

  const cardMap = {
    blue: "border-cyan-100/80 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-violet-500/10",
    red: "border-rose-100/80 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-rose-500/10",
    green:
      "border-emerald-100/80 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10",
    amber:
      "border-amber-100/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10",
    purple:
      "border-violet-100/80 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10",
  };

  return (
    <div
      className={`rounded-2xl border p-4 flex items-center gap-3 shadow-sm min-w-0 ${cardMap[accent]}`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${accentMap[accent]}`}
      >
        <div className="scale-90">{icon}</div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
          {label}
        </p>
        <p className="text-base sm:text-lg xl:text-xl font-black text-foreground tabular-nums leading-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

export const LoanDashboardCards = React.memo(function LoanDashboardCards({
  stats,
}: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-4">
      <StatCard
        label="Active Loans"
        value={stats.activeLoans}
        icon={<Users className="w-6 h-6" />}
        accent="blue"
      />
      <StatCard
        label="Overdue"
        value={stats.overdueLoans}
        icon={<AlertTriangle className="w-6 h-6" />}
        accent="red"
      />
      <StatCard
        label="Disbursed"
        value={fmt(stats.totalDisbursed)}
        icon={<IndianRupee className="w-6 h-6" />}
        accent="green"
      />
      <StatCard
        label="Outstanding"
        value={fmt(stats.totalOutstanding)}
        icon={<Wallet className="w-6 h-6" />}
        accent="amber"
      />
      <StatCard
        label="Today"
        value={fmt(stats.collectedToday)}
        icon={<TrendingUp className="w-6 h-6" />}
        accent="purple"
      />
      <StatCard
        label="Txns Today"
        value={stats.transactionsToday}
        icon={<Activity className="w-6 h-6" />}
        accent="blue"
      />
    </div>
  );
});
