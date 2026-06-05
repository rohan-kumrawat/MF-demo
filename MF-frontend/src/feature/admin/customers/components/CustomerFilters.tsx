import React, { useMemo } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useAgents } from "../hooks/useAgents";
import type { CustomerFilters as FilterType } from "../types";

interface Props {
  filters: FilterType;
  onFilterChange: (key: keyof FilterType, value: string) => void;
  onClearFilters: () => void;
  search: string;
  onSearchChange: (value: string) => void;
}

export const CustomerFilters = React.memo(function CustomerFilters({
  filters,
  onFilterChange,
  onClearFilters,
  search,
  onSearchChange,
}: Props) {
  const { data: agents = [] } = useAgents();

  const statusOptions = [
    { v: "all", l: "All Statuses" },
    { v: "active", l: "Active" },
    { v: "due", l: "Due / Overdue" },
    { v: "defaulter", l: "Defaulter" },
  ];

  const riskOptions = [
    { v: "all", l: "All Risk Levels" },
    { v: "low", l: "Low" },
    { v: "medium", l: "Medium" },
    { v: "high", l: "High" },
  ];

  const agentOptions = useMemo(() => {
    return [
      { v: "all", l: "All Agents" },
      ...agents.map((a) => ({ v: a.id, l: a.name })),
    ];
  }, [agents]);

  const activeChips: { key: keyof FilterType; label: string }[] = [];
  if (filters.status && filters.status !== "all") {
    activeChips.push({
      key: "status",
      label:
        statusOptions.find((o) => o.v === filters.status)?.l ?? filters.status,
    });
  }
  if (filters.risk && filters.risk !== "all") {
    activeChips.push({
      key: "risk",
      label: riskOptions.find((o) => o.v === filters.risk)?.l ?? filters.risk,
    });
  }
  if (filters.agent && filters.agent !== "all") {
    activeChips.push({
      key: "agent",
      label:
        agentOptions.find((o) => o.v === filters.agent)?.l ?? filters.agent,
    });
  }

  return (
    <div className="space-y-3">
      {/* Row 1: Search + Advanced */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 min-w-56 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name..."
            className="pl-10 pr-9 rounded-full bg-muted border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/20"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  filters.status && filters.status !== "all"
                    ? "bg-primary text-white border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-accent"
                }`}
              >
                {statusOptions.find((o) => o.v === (filters.status || "all"))
                  ?.l ?? "All Statuses"}
                <ChevronDown
                  className={`w-3.5 h-3.5 ${filters.status && filters.status !== "all" ? "text-white" : "text-muted-foreground"}`}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {statusOptions.map(({ v, l }) => (
                <DropdownMenuItem
                  key={v}
                  onClick={() => onFilterChange("status", v)}
                >
                  {l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  filters.risk && filters.risk !== "all"
                    ? "bg-primary text-white border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-accent"
                }`}
              >
                {riskOptions.find((o) => o.v === (filters.risk || "all"))?.l ??
                  "All Risk Levels"}
                <ChevronDown
                  className={`w-3.5 h-3.5 ${filters.risk && filters.risk !== "all" ? "text-white" : "text-muted-foreground"}`}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {riskOptions.map(({ v, l }) => (
                <DropdownMenuItem
                  key={v}
                  onClick={() => onFilterChange("risk", v)}
                >
                  {l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`flex items-center gap-1.5 pl-3 pr-2.5 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 ${
                  filters.agent && filters.agent !== "all"
                    ? "bg-primary text-white border-primary"
                    : "bg-muted text-muted-foreground border-border hover:bg-accent"
                }`}
              >
                {agentOptions.find((o) => o.v === (filters.agent || "all"))
                  ?.l ?? "All Agents"}
                <ChevronDown
                  className={`w-3.5 h-3.5 ${filters.agent && filters.agent !== "all" ? "text-white" : "text-muted-foreground"}`}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {agentOptions.map(({ v, l }) => (
                <DropdownMenuItem
                  key={v}
                  onClick={() => onFilterChange("agent", v)}
                >
                  {l}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {activeChips.length > 0 && (
            <button
              onClick={onClearFilters}
              className="text-xs text-muted-foreground hover:text-destructive font-semibold px-2 py-2 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Filter dropdowns */}

      {/* Row 3: Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider">
            Active:
          </span>
          {activeChips.map(({ key, label }) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-semibold"
            >
              {label}
              <button
                onClick={() => onFilterChange(key, "all")}
                className="hover:text-destructive transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
});
