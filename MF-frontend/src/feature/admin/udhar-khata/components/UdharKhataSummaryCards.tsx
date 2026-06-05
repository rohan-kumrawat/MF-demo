import { Card, CardContent } from "@/components/ui/card";
import { formatRupee } from "@/data/demoData";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { HandCoins, ReceiptIndianRupee, Scale, Users } from "lucide-react";
import type { KhataSummary } from "../types";

interface UdharKhataSummaryCardsProps {
  summary: KhataSummary;
  isLoading?: boolean;
}

interface SummaryCardProps {
  label: string;
  description?: string;
  value: string | number;
  icon: React.ReactNode;
  iconClassName: string;
  cardClassName: string;
  valueClassName?: string;
}

function SummaryCard({
  label,
  description,
  value,
  icon,
  iconClassName,
  cardClassName,
  valueClassName,
}: SummaryCardProps) {
  return (
    <Card
      className={cn(
        "border shadow-sm rounded-2xl transition-all hover:shadow-md hover:-translate-y-0.5",
        cardClassName,
      )}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border",
            iconClassName,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-0.5 truncate">
            {label}
          </p>
          <p
            className={cn(
              "text-xl font-black tracking-tight tabular-nums truncate",
              valueClassName,
            )}
          >
            {value}
          </p>
          {description && (
            <p className="mt-1 text-[11px] font-medium leading-snug text-muted-foreground/80">
              {description}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function UdharKhataSummaryCards({
  summary,
  isLoading = false,
}: UdharKhataSummaryCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="border shadow-sm rounded-2xl border-border/50 bg-card"
          >
            <CardContent className="p-4 flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <SummaryCard
        label="Total Liye"
        description="Total liya gaya amount"
        value={formatRupee(summary.totalLena)}
        icon={<HandCoins className="w-6 h-6" />}
        iconClassName="bg-emerald-500/10 text-emerald-700 border-emerald-200"
        cardClassName="border-emerald-100/80 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-emerald-500/10"
        valueClassName="text-emerald-700"
      />

      <SummaryCard
        label="Total Diye"
        description="Total diya gaya amount"
        value={formatRupee(summary.totalDena)}
        icon={<ReceiptIndianRupee className="w-6 h-6" />}
        iconClassName="bg-rose-500/10 text-rose-700 border-rose-200"
        cardClassName="border-rose-100/80 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-rose-500/10"
        valueClassName="text-rose-700"
      />

      <SummaryCard
        label="Net Amount"
        description="Net amount"
        value={formatRupee(summary.netPos)}
        icon={<Scale className="w-6 h-6" />}
        iconClassName={cn(
          "border",
          summary.netPos >= 0
            ? "bg-cyan-500/10 text-cyan-700 border-cyan-200"
            : "bg-amber-500/10 text-amber-700 border-amber-200",
        )}
        cardClassName={cn(
          "border",
          summary.netPos >= 0
            ? "border-cyan-100/80 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-cyan-500/10"
            : "border-amber-100/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10",
        )}
        valueClassName={
          summary.netPos >= 0 ? "text-cyan-700" : "text-amber-700"
        }
      />

      <SummaryCard
        label="Khatedar"
        value={`${summary.totalKhatedars} (${summary.activeKhatedars} active)`}
        icon={<Users className="w-6 h-6" />}
        iconClassName="bg-violet-500/10 text-violet-700 border-violet-200"
        cardClassName="border-violet-100/80 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-violet-500/10"
        valueClassName="text-violet-700"
      />
    </div>
  );
}
