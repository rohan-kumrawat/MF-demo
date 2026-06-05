// src/feature/admin/loans/components/LoanFiltersBar.tsx
import React from "react";
import { Search, X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { LoanFilters, LoanStatus } from "../types";

interface Props {
  filters: LoanFilters;
  onFiltersChange: (filters: LoanFilters) => void;
}

const STATUS_OPTIONS: { v: LoanStatus | "all"; l: string }[] = [
  { v: "all", l: "All Status" },
  { v: "active", l: "Active" },
  { v: "closed", l: "Closed" },
  { v: "pre_closed", l: "Pre-Closed" },
];

export const LoanFiltersBar = React.memo(function LoanFiltersBar({
  filters,
  onFiltersChange,
}: Props) {
  const activeStatus = filters.status ?? "all";
  const activeOverdue = filters.overdue ?? false;
  const activeSearch = filters.search ?? "";

  const hasActiveFilters =
    activeStatus !== "all" || activeOverdue || !!activeSearch;

  const setSearch = (search: string) => onFiltersChange({ ...filters, search });
  const setStatus = (status: string) =>
    onFiltersChange({
      ...filters,
      status: status === "all" ? undefined : (status as LoanStatus),
    });
  const clearAll = () => onFiltersChange({});

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-600" />
          <input
            value={activeSearch}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by loan #, customer name..."
            className="w-full pl-10 pr-9 py-2.5 bg-card border-2 border-cyan-200 rounded-xl text-sm focus:outline-none focus:border-cyan-400 shadow-sm transition-all"
          />
          {activeSearch && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
        </div>

        {/* Status dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={`flex items-center gap-1.5 pl-3 pr-2.5 py-2.5 rounded-xl text-xs font-bold border transition-colors ${
                activeStatus !== "all"
                  ? "gradient-primary text-white border-transparent shadow-sm"
                  : "bg-card text-slate-700 border-2 border-cyan-200 hover:border-cyan-400"
              }`}
            >
              {STATUS_OPTIONS.find((o) => o.v === activeStatus)?.l ??
                "All Status"}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {STATUS_OPTIONS.map(({ v, l }) => (
              <DropdownMenuItem key={v} onClick={() => setStatus(v)}>
                {l}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors px-2 py-2"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
});
