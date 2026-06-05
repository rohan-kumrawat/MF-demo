// src/feature/admin/daily-register/components/DayRegisterCard.tsx
import React from "react";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";
import type { DayRegister } from "../types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, localToday } from "@/lib/utils";

const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));

interface Props {
  day: DayRegister;
  onClick: () => void;
}

export const DayRegisterCard = React.memo(function DayRegisterCard({
  day,
  onClick,
}: Props) {
  const isToday = localToday() === day.entryDate;

  return (
    <Card
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-md group rounded-2xl overflow-hidden py-0",
        isToday
          ? "border-primary/50 bg-primary/5 ring-1 ring-primary/5"
          : "border-border/50 hover:border-primary/30 shadow-none",
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                isToday
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
              )}
            >
              <Calendar className="size-5" />
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-black text-foreground tracking-tight">
                {day.entryDate}
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                {isToday ? "Today" : "Register"}
              </p>
            </div>
          </div>
          {isToday && (
            <Badge
              variant="secondary"
              className="bg-green-600/10 text-green-600 border-none font-black text-[9px] px-1.5 h-5 rounded-md uppercase tracking-tighter"
            >
              Active
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="flex flex-col gap-1">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 opacity-70">
              <TrendingUp className="size-2.5 text-green-600" /> Opening
            </p>
            <p className="text-sm font-black text-foreground tabular-nums tracking-tight">
              {fmt(day.openingBalance)}
            </p>
          </div>
          <div className="text-right flex flex-col gap-1">
            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1 justify-end opacity-70">
              <TrendingDown className="size-2.5 text-destructive" /> Closing
            </p>
            <p className="text-sm font-black text-foreground tabular-nums tracking-tight">
              {day.closingBalance ? fmt(day.closingBalance) : "—"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
