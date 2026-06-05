// src/feature/admin/diary/components/DiaryAccountCard.tsx
import React from "react";
import type { DiaryAccount } from "../types";
import { User2, Phone, CalendarDays, ChevronRight, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDisplayDate } from "@/lib/utils";

const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));

const formatDiaryName = (name?: string): string => {
  if (!name) return "Unnamed Diary";
  return name
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

interface Props {
  account: DiaryAccount;
  onClick: () => void;
  onEdit: (account: DiaryAccount) => void;
}

export const DiaryAccountCard = React.memo(function DiaryAccountCard({
  account,
  onClick,
  onEdit,
}: Props) {
  const customerName = account.customer?.name || "Unknown Customer";
  const customerPhone = account.customer?.phone || "No phone";
  const diaryName = formatDiaryName(account.diaryName);

  const cycleLabel = account.cycleStartDate
    ? formatDisplayDate(account.cycleStartDate)
    : "No deposits yet";
  const isNegativeBalance = Number(account.balance) < 0;

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer hover:border-primary/50 hover:shadow-md transition-all duration-300 relative overflow-hidden bg-card"
    >
      <CardContent className="px-4">
        {/* Top section: smaller avatar, tighter spacing */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white ">
              <User2 className="w-4 h-4 " />
            </div>
            <div className="flex flex-col min-w-0">
              <h3 className="font-bold text-sm text-foreground truncate max-w-[120px] tracking-tight">
                {customerName}
              </h3>
              <div className="flex items-center text-[11px] text-muted-foreground gap-1">
                <Phone className="w-3 h-3" />
                <span className="font-medium">{customerPhone}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-md hover:bg-primary/10 text-primary/70 hover:text-primary transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(account);
              }}
            >
              <Pencil className="w-3 h-3" />
            </Button>
            <Badge
              variant="outline"
              className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-black uppercase tracking-wider h-5 px-1.5"
            >
              Active
            </Badge>
          </div>
        </div>

        {/* Compact balance hero */}
        <div className="mb-3">
          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground mb-0.5">
            Balance
          </p>
          <p
            className={cn(
              "text-2xl font-black tabular-nums tracking-tight leading-8",
              isNegativeBalance ? "text-destructive" : "text-foreground",
            )}
          >
            {fmt(account.balance)}
          </p>
        </div>

        {/* Bottom row: tighter spacing & smaller text */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-muted-foreground/10">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {/* Diary Name */}
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-muted-foreground">Diary:</span>
              <span className="text-[11px] font-medium text-foreground/90">
                {diaryName}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-muted-foreground">ID:</span>
              <span className="text-[11px] font-mono font-bold text-foreground/90">
                {account.accountCode || "N/A"}
              </span>
            </div>
          </div>

          {/* Cycle Start Date */}
          <div className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-muted-foreground" />
            <div className="flex flex-col items-start">
              <span className="text-[8px] font-black uppercase tracking-wider text-muted-foreground leading-none">
                Cycle Start
              </span>
              <span className="text-[10px] font-medium text-foreground/80">
                {cycleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Always-visible compact chevron */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <ChevronRight className="w-4 h-4 text-primary/70" strokeWidth={2.5} />
        </div>
      </CardContent>
    </Card>
  );
});
