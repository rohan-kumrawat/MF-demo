import React, { useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { useCombinedTransactions } from "../../feature/admin/reports/hooks/useReports";
import type {
  CombinedTransaction,
  CombinedTransactionsFilters,
} from "../../feature/admin/reports/types";
import { formatDisplayDate, localDateStr, localToday } from "../../lib/utils";
import { format, parseISO } from "date-fns";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Skeleton } from "../../components/ui/skeleton";
import { DatePickerField } from "../../components/ui/date-picker-field";
import {
  History,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Printer,
} from "lucide-react";
import { cn } from "../../lib/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(amount: number | null | undefined) {
  if (amount == null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function fmtDate(dateStr: string | null | undefined) {
  return formatDisplayDate(dateStr);
}

function formatFilterDate(value: string | undefined) {
  if (!value) return "";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

type DateQuickFilter = "custom" | "week" | "all";

function getDateRange(
  filter: DateQuickFilter,
  customDate: string,
): { from: string; to: string } {
  const today = new Date();
  const iso = (d: Date) => localDateStr(d);
  if (filter === "custom") return { from: customDate, to: customDate };
  if (filter === "week") {
    const week = new Date(today);
    week.setDate(today.getDate() - 7);
    return { from: iso(week), to: iso(today) };
  }
  return { from: "2020-01-01", to: iso(today) };
}

// ── TypeBadge ─────────────────────────────────────────────────────────────────

function TypeBadge({ source, type }: { source: string; type: string }) {
  const isLoan = source === "loan";
  const colors: Record<string, string> = {
    emi: "bg-blue-100 text-blue-700 border-blue-200",
    full_payment: "bg-green-100 text-green-700 border-green-200",
    penalty: "bg-red-100 text-red-700 border-red-200",
    other: "bg-gray-100 text-gray-600 border-gray-200",
    credit: "bg-emerald-100 text-emerald-700 border-emerald-200",
    debit: "bg-orange-100 text-orange-700 border-orange-200",
  };
  return (
    <div className="flex flex-col gap-0.5">
      <Badge
        variant="outline"
        className={`text-[10px] font-semibold capitalize px-2 py-0 ${
          isLoan
            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
            : "bg-teal-50 text-teal-700 border-teal-200"
        }`}
      >
        {isLoan ? "Loan" : "Diary"}
      </Badge>
      <Badge
        variant="outline"
        className={`text-[10px] capitalize px-2 py-0 ${
          colors[type] ?? "bg-gray-100 text-gray-600"
        }`}
      >
        {type.replace("_", " ")}
      </Badge>
    </div>
  );
}

// ── Transaction Card ──────────────────────────────────────────────────────────

function TransactionCard({ tx }: { tx: CombinedTransaction }) {
  const ref = tx.loanAccountNumber ?? tx.diaryAccountCode;
  const hasBreakdown =
    (tx.principalPart ?? 0) > 0 ||
    (tx.interestPart ?? 0) > 0 ||
    (tx.penaltyPart ?? 0) > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <TypeBadge source={tx.source} type={tx.type} />
        <div className="flex items-center gap-3">
          <span className="text-base font-black text-green-600 shrink-0">
            {fmt(tx.amount)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              window.open(`/receipt/${tx.id}?source=${tx.source}`, "_blank")
            }
            className="h-8 w-8 text-gray-400 hover:text-primary bg-gray-50 hover:bg-primary/10 rounded-full transition-colors"
            title="Print Receipt"
          >
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Row 2: Customer + Date */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {tx.customerName}
        </p>
        <p className="text-xs text-gray-400 shrink-0 whitespace-nowrap">
          {fmtDate(tx.paymentDate)}
        </p>
      </div>

      {/* Row 3: Ref + Mode */}
      <div className="flex items-center justify-between gap-2">
        {ref ? (
          <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
            {ref}
          </span>
        ) : (
          <span />
        )}
        {tx.paymentMode && (
          <Badge variant="outline" className="text-[10px] capitalize">
            {tx.paymentMode}
          </Badge>
        )}
      </div>

      {/* Row 4: Breakdown */}
      {hasBreakdown && (
        <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
          {(tx.principalPart ?? 0) > 0 && (
            <span className="text-[11px] text-gray-400">
              P:{" "}
              <span className="font-medium text-gray-600">
                {fmt(tx.principalPart)}
              </span>
            </span>
          )}
          {(tx.interestPart ?? 0) > 0 && (
            <span className="text-[11px] text-gray-400">
              I:{" "}
              <span className="font-medium text-gray-600">
                {fmt(tx.interestPart)}
              </span>
            </span>
          )}
          {(tx.penaltyPart ?? 0) > 0 && (
            <span className="text-[11px] text-gray-400">
              Pen:{" "}
              <span className="font-medium text-red-500">
                {fmt(tx.penaltyPart)}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const AgentHistory: React.FC = () => {
  const { user } = useAuthStore();
  const agentId = user?.id ?? "";

  const [dateFilter, setDateFilter] = useState<DateQuickFilter>("custom");
  const [customDate, setCustomDate] = useState(() => localToday());
  const [source, setSource] = useState<"" | "loan" | "diary">("");
  const [showOnlyMine, setShowOnlyMine] = useState(false);
  const [page, setPage] = useState(1);

  const { from, to } = getDateRange(dateFilter, customDate);
  const LIMIT = 20;

  const filters: CombinedTransactionsFilters = {
    from,
    to,
    source: source === "" ? undefined : source,
    agentId: showOnlyMine ? agentId : undefined,
    page,
    limit: LIMIT,
  };

  const { data, isLoading, isFetching } = useCombinedTransactions(filters);

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 1;
  const transactions = data?.data ?? [];

  function handleSource(value: "" | "loan" | "diary") {
    setSource(value);
    setPage(1);
  }

  const activeLabel =
    dateFilter === "custom"
      ? "Selected Date"
      : dateFilter === "week"
        ? "This Week"
        : "All Time";

  return (
    <div className="space-y-4 animate-fade-in pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <History className="text-primary" size={24} />
          Transaction History
        </h2>
        {isFetching && !isLoading && (
          <span className="text-xs text-gray-400 animate-pulse">
            Refreshing…
          </span>
        )}
      </div>

      {/* Date Quick-Filters */}
      <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm gap-1 overflow-x-auto">
        <div className="flex-1 min-w-[130px] sm:min-w-[140px]">
          <DatePickerField
            value={customDate}
            onChange={(val) => {
              if (val) {
                setCustomDate(val);
                setDateFilter("custom");
                setPage(1);
              }
            }}
            buttonClassName={cn(
              "w-full h-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 shadow-none hover:bg-transparent",
              dateFilter === "custom"
                ? "bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                : "bg-transparent text-gray-500 hover:bg-gray-50",
            )}
            className={dateFilter === "custom" ? "text-white" : "text-gray-500"}
          />
        </div>
        <button
          onClick={() => {
            setDateFilter("week");
            setPage(1);
          }}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            dateFilter === "week"
              ? "bg-gray-900 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50",
          )}
        >
          This Week
        </button>
        <button
          onClick={() => {
            setDateFilter("all");
            setPage(1);
          }}
          className={cn(
            "flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            dateFilter === "all"
              ? "bg-gray-900 text-white shadow-md"
              : "text-gray-500 hover:bg-gray-50",
          )}
        >
          All Time
        </button>
      </div>

      {/* Source Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex gap-2 w-full sm:w-auto">
          {(["", "loan", "diary"] as const).map((s) => (
            <button
              key={s || "all"}
              onClick={() => handleSource(s)}
              className={cn(
                "flex-1 sm:flex-none sm:px-8 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                source === s
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50",
              )}
            >
              {s === "" ? "All" : s === "loan" ? "Loan" : "Diary"}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setShowOnlyMine(!showOnlyMine);
              setPage(1);
            }}
            className={cn(
              "flex-1 sm:flex-none sm:px-6 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer whitespace-nowrap",
              showOnlyMine
                ? "bg-gray-900 text-white border-gray-900"
                : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50",
            )}
          >
            My Transactions
          </button>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="gradient-primary rounded-3xl p-5 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
        <div className="absolute right-[-8%] top-[-10%] opacity-10">
          <Calendar size={100} />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mb-1">
            Total Activity ({activeLabel})
          </p>
          {isLoading ? (
            <Skeleton className="h-8 w-32 bg-white/20 mt-1" />
          ) : (
            <>
              <div className="flex gap-6 mt-1">
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-1 text-green-300">
                    <IndianRupee size={16} className="opacity-80" />
                    {Number(data?.totalIn ?? 0).toLocaleString("en-IN")}
                  </h3>
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
                    In
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-black flex items-center gap-1 text-red-300">
                    <IndianRupee size={16} className="opacity-80" />
                    {Number(data?.totalOut ?? 0).toLocaleString("en-IN")}
                  </h3>
                  <p className="text-[10px] text-white/60 font-medium uppercase tracking-wider">
                    Out
                  </p>
                </div>
              </div>
              <p className="text-xs text-white/60 mt-2 font-medium">
                {data?.total ?? 0} Transactions
              </p>
            </>
          )}
        </div>
      </div>

      {/* Date range label */}
      {!isLoading && (
        <p className="text-[11px] text-gray-400 text-center -mt-1">
          {formatFilterDate(from)}
          {from !== to ? ` – ${formatFilterDate(to)}` : ""}
        </p>
      )}

      {/* Cards */}
      <div className="space-y-3">
        {isLoading &&
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

        {!isLoading && transactions.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
            <History size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm text-gray-400 font-medium">
              No transactions found for this period.
            </p>
          </div>
        )}

        {!isLoading &&
          transactions.map((tx) => <TransactionCard key={tx.id} tx={tx} />)}
      </div>

      {/* Pagination */}
      {!isLoading && data && data.total > LIMIT && (
        <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 px-4 py-3">
          <p className="text-xs text-gray-400">
            {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, data.total)} of{" "}
            {data.total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-semibold text-gray-700">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentHistory;
