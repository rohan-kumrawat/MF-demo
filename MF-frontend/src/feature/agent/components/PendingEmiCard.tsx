// src/feature/agent/components/PendingEmiCard.tsx
import React from "react";
import { ChevronRight, Calendar, User } from "lucide-react";
import { formatRupee } from "../../../data/demoData";
import { cn } from "../../../lib/utils";
import type { PendingEmi } from "../types";

interface Props {
  emi: PendingEmi;
  onClick: (customerId: string) => void;
}

export const PendingEmiCard = React.memo(function PendingEmiCard({
  emi,
  onClick,
}: Props) {
  if (!emi) return null;

  const statusMap: Record<string, { badge: string; label: string }> = {
    "due-soon": { badge: "status-yellow", label: "Due Soon" },
    overdue: { badge: "status-orange", label: "Overdue" },
    "high-risk": { badge: "status-red", label: "High Risk" },
  };

  const status = statusMap[emi?.status] || statusMap["due-soon"];
  const { badge } = status;

  return (
    <div
      onClick={() => onClick(emi.customerId)}
      className="group bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:border-primary/20 hover:shadow-md"
    >
      <div
        className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-white",
          emi.status === "due-soon"
            ? "bg-amber-500"
            : emi.status === "overdue"
              ? "bg-orange-500"
              : "bg-destructive",
        )}
      >
        <User size={20} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <h4 className="font-bold text-gray-900 truncate">
            {emi.customerName}
          </h4>
          <span
            className={cn(
              "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter",
              badge,
            )}
          >
            {emi.daysLabel}
          </span>
        </div>
        <div className="flex items-center gap-3 text-gray-500 text-xs">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {emi.daysLabel}
          </span>
          <span className="font-bold text-primary">
            {formatRupee(emi.amount)}
          </span>
        </div>
      </div>

      <div className="text-gray-300 group-hover:text-primary transition-colors">
        <ChevronRight size={20} />
      </div>
    </div>
  );
});
