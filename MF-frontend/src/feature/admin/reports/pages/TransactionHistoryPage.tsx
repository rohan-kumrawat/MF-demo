// src/feature/admin/reports/pages/TransactionHistoryPage.tsx
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useQueryClient } from "@tanstack/react-query";
import { Calendar as CalendarIcon } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  History,
  IndianRupee,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCombinedTransactions } from "../hooks/useReports";
import { useCustomers } from "@/feature/admin/customers/hooks/useCustomers";
import { useAgents } from "@/feature/admin/customers/hooks/useAgents";
import { useDiaryAccounts } from "@/feature/admin/diary/hooks/useDiary";
import {
  useDeleteDiaryTransaction,
  useEditDiaryTransaction,
} from "@/feature/admin/diary/hooks/useDiary";
import {
  useDeleteLoanTransaction,
  useEditLoanTransaction,
} from "@/feature/admin/loans/hooks/useLoans";
import { EditTransactionModal as EditLoanTransactionModal } from "@/feature/admin/loans/components/EditTransactionModal";
import { EditTransactionModal as EditDiaryTransactionModal } from "@/feature/admin/diary/components/EditTransactionModal";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  CombinedTransaction,
  CombinedTransactionsFilters,
} from "../types";
import type { Transaction } from "@/types/loan.types";
import type { DiaryTransaction } from "@/types/diary.types";
import type { EditTransactionFormData } from "@/feature/admin/loans/schemas/loan.schema";
import type { EditDiaryTransactionFormData } from "@/feature/admin/diary/schemas/diary.schema";
import { formatDisplayDate } from "@/lib/utils";
import { format, parseISO } from "date-fns";

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmt(amount: number | null | undefined) {
  if (amount == null) return "—";
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function fmtDate(dateStr: string | null | undefined) {
  return formatDisplayDate(dateStr);
}

function TypeBadge({ source, type }: { source: string; type: string }) {
  const isLoan = source === "loan";
  const colors: Record<string, string> = {
    emi: "bg-sky-500/10 text-sky-700 border-sky-200",
    full_payment: "bg-emerald-500/10 text-emerald-700 border-emerald-200",
    disbursal: "bg-rose-500/10 text-rose-700 border-rose-200",
    penalty: "bg-rose-500/10 text-rose-700 border-rose-200",
    other: "bg-slate-500/10 text-slate-600 border-slate-200",
    credit: "bg-green-500/10 text-green-700 border-green-200",
    debit: "bg-orange-500/10 text-orange-700 border-orange-200",
  };
  return (
    <div className="flex flex-col gap-1">
      <Badge
        variant="outline"
        className={`text-[10px] font-semibold capitalize px-2 py-0.5 shadow-sm ${
          isLoan
            ? "bg-indigo-500/10 text-indigo-700 border-indigo-200"
            : "bg-teal-500/10 text-teal-700 border-teal-200"
        }`}
      >
        {isLoan ? "Loan" : "Diary"}
      </Badge>
      <Badge
        variant="outline"
        className={`text-[10px] capitalize px-2 py-0.5 shadow-sm ${
          colors[type] ?? "bg-slate-500/10 text-slate-600 border-slate-200"
        }`}
      >
        {type.replace("_", " ")}
      </Badge>
    </div>
  );
}

function formatFilterDate(value: string | undefined) {
  if (!value) return "";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

function isoToDate(value: string | undefined) {
  if (!value) return undefined;
  try {
    return parseISO(value);
  } catch {
    return undefined;
  }
}

function toLoanTransaction(tx: CombinedTransaction): Transaction {
  return {
    id: tx.id,
    loanId: tx.loanId ?? "",
    type: tx.type as Transaction["type"],
    amount: tx.amount,
    principalPart: tx.principalPart ?? 0,
    interestPart: tx.interestPart ?? 0,
    penaltyPart: tx.penaltyPart ?? 0,
    paymentMode: (tx.paymentMode ?? "cash") as Transaction["paymentMode"],
    receiptNo: tx.receiptNo ?? "",
    paymentDate: tx.paymentDate,
    collectedBy: tx.agentId ?? "",
    isReversed: false,
    diaryAmount: undefined,
    diaryAccountId: tx.diaryId ?? undefined,
    createdAt: tx.createdAt,
  };
}

function toDiaryTransaction(tx: CombinedTransaction): DiaryTransaction {
  const normalizedType = tx.type.toLowerCase();
  const diaryType: DiaryTransaction["type"] = normalizedType.includes(
    "interest",
  )
    ? "INTEREST"
    : normalizedType === "credit" || normalizedType === "deposit"
      ? "DEPOSIT"
      : "WITHDRAWAL";

  return {
    id: tx.id,
    centreId: "",
    accountId: tx.diaryId ?? "",
    customerId: tx.customerId,
    type: diaryType,
    amount: tx.amount,
    balanceBefore: 0,
    balanceAfter: 0,
    transactionDate: tx.paymentDate,
    notes: tx.notes ?? undefined,
    performedBy: tx.agentId ?? "",
    isReversed: false,
    reversedBy: null,
    reversedAt: null,
    createdAt: tx.createdAt,
  };
}

// ── Stat Card ──────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon,
  isLoading,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}) {
  const variantClasses =
    title === "Total Payment In"
      ? {
          card: "border-none shadow-md bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl hover:shadow-lg transition-shadow",
          icon: "bg-green-500/10 text-green-700",
          title:
            "text-[11px] font-bold text-green-700/70 uppercase tracking-wider",
          value: "text-2xl font-black text-green-700 tracking-tight",
        }
      : title === "Total Payment Out"
        ? {
            card: "border-none shadow-md bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl hover:shadow-lg transition-shadow",
            icon: "bg-red-500/10 text-red-700",
            title:
              "text-[11px] font-bold text-red-700/70 uppercase tracking-wider",
            value: "text-2xl font-black text-red-700 tracking-tight",
          }
        : title === "Net Balance"
          ? {
              card: "border-none shadow-md bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl hover:shadow-lg transition-shadow",
              icon: "bg-amber-500/10 text-amber-700",
              title:
                "text-[11px] font-bold text-amber-700/70 uppercase tracking-wider",
              value: "text-2xl font-black text-amber-700 tracking-tight",
            }
          : title === "Showing Page"
            ? {
                card: "border-none shadow-md bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl hover:shadow-lg transition-shadow",
                icon: "bg-blue-500/10 text-blue-700",
                title:
                  "text-[11px] font-bold text-blue-700/70 uppercase tracking-wider",
                value: "text-2xl font-black text-blue-700 tracking-tight",
              }
            : {
                card: "border-none shadow-md bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 rounded-2xl hover:shadow-lg transition-shadow",
                icon: "bg-indigo-500/10 text-indigo-700",
                title:
                  "text-[11px] font-bold text-indigo-700/70 uppercase tracking-wider",
                value: "text-2xl font-black text-indigo-700 tracking-tight",
              };

  return (
    <Card className={variantClasses.card}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`rounded-xl p-3 shrink-0 ${variantClasses.icon}`}>
          {icon}
        </div>
        <div>
          <p className={variantClasses.title}>{title}</p>
          {isLoading ? (
            <Skeleton className="h-7 w-24 mt-1" />
          ) : (
            <p className={variantClasses.value}>{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function TransactionHistoryPage() {
  const role = useAuthStore((s) => s.role);
  const queryClient = useQueryClient();
  const editLoanTransaction = useEditLoanTransaction();
  const deleteLoanTransaction = useDeleteLoanTransaction();
  const editDiaryTransaction = useEditDiaryTransaction();
  const deleteDiaryTransaction = useDeleteDiaryTransaction();
  const [filters, setFilters] = useState<CombinedTransactionsFilters>({
    page: 1,
    limit: 50,
  });
  const [editingTx, setEditingTx] = useState<CombinedTransaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<CombinedTransaction | null>(
    null,
  );
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);

  const refreshTransactions = () =>
    queryClient.invalidateQueries({ queryKey: ["reports", "transactions"] });

  // Dropdown data
  const { data: customersData } = useCustomers();
  const customers = customersData?.data ?? [];
  const { data: agents = [] } = useAgents();
  const { data: diaries = [] } = useDiaryAccounts();
  const diaryCodeById = new Map(
    diaries.map((diary) => [diary.id, diary.accountCode]),
  );

  const { data, isLoading, isError, isFetching } =
    useCombinedTransactions(filters);

  const totalPages = data ? Math.ceil(data.total / (filters.limit ?? 50)) : 1;
  const currentPage = filters.page ?? 1;

  function setFilter<K extends keyof CombinedTransactionsFilters>(
    key: K,
    value: CombinedTransactionsFilters[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  }

  function clearFilters() {
    setFilters({ page: 1, limit: 50 });
  }

  const hasActiveFilters =
    filters.source ||
    filters.from ||
    filters.to ||
    filters.agentId ||
    filters.customerId ||
    filters.diaryId;

  return (
    <div className="p-4 md:p-6 space-y-4 bg-gradient-to-b from-background via-background to-muted/20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-indigo-600" />
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Transaction History
          </h1>
          {isFetching && !isLoading && (
            <span className="text-xs font-medium text-indigo-600 animate-pulse ml-2">
              Refreshing…
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800"
          >
            <X className="h-3.5 w-3.5 mr-1.5" />
            Clear Filters
          </Button>
        )}
      </div>

      {/* ── Filters Panel ── */}
      <Card className="border-none shadow-md rounded-2xl bg-card/90">
        <CardHeader className="pb-2 bg-gradient-to-r from-indigo-500/5 via-transparent to-teal-500/5 rounded-t-2xl">
          <CardTitle className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            Filters (all optional, all combinable)
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Source */}
          <div className="col-span-2 sm:col-span-1 flex gap-2">
            {(["", "loan", "diary"] as const).map((s) => (
              <Button
                key={s || "all"}
                size="sm"
                variant={(filters.source ?? "") === s ? "default" : "outline"}
                onClick={() => setFilter("source", s === "" ? undefined : s)}
                className="flex-1 text-xs"
              >
                {s === "" ? "All" : s === "loan" ? "Loan" : "Diary"}
              </Button>
            ))}
          </div>

          {/* From */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              From Date (DD/MM/YYYY)
            </label>
            <Popover open={fromOpen} onOpenChange={setFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-sm h-9 border-2 border-indigo-200 bg-card hover:border-indigo-300"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  {filters.from ? formatFilterDate(filters.from) : "DD/MM/YYYY"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={isoToDate(filters.from)}
                  onSelect={(date) => {
                    setFilter(
                      "from",
                      date ? format(date, "yyyy-MM-dd") : undefined,
                    );
                    setFromOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* To */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              To Date (DD/MM/YYYY)
            </label>
            <Popover open={toOpen} onOpenChange={setToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal text-sm h-9 border-2 border-indigo-200 bg-card hover:border-indigo-300"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                  {filters.to ? formatFilterDate(filters.to) : "DD/MM/YYYY"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={isoToDate(filters.to)}
                  onSelect={(date) => {
                    setFilter(
                      "to",
                      date ? format(date, "yyyy-MM-dd") : undefined,
                    );
                    setToOpen(false);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Customer */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Customer
            </label>
            <Select
              value={filters.customerId ?? "all"}
              onValueChange={(v) =>
                setFilter("customerId", v === "all" ? undefined : v)
              }
            >
              <SelectTrigger className="text-sm h-9 border-2 border-indigo-200 bg-card hover:border-indigo-300">
                <SelectValue placeholder="Select Customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Perform By */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Perform By
            </label>
            <Select
              value={filters.agentId ?? "all"}
              onValueChange={(v) =>
                setFilter("agentId", v === "all" ? undefined : v)
              }
            >
              <SelectTrigger className="text-sm h-9 border-2 border-indigo-200 bg-card hover:border-indigo-300">
                <SelectValue placeholder="Select Performer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performers</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Diary */}
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">
              Diary Account
            </label>
            <Select
              value={filters.diaryId ?? "all"}
              onValueChange={(v) =>
                setFilter("diaryId", v === "all" ? undefined : v)
              }
            >
              <SelectTrigger className="text-sm h-9 border-2 border-indigo-200 bg-card hover:border-indigo-300">
                <SelectValue placeholder="Select Diary" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Diaries</SelectItem>
                {diaries.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.diaryName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <StatCard
          title="Total Transactions"
          value={isLoading ? "—" : String(data?.total ?? 0)}
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Payment In"
          value={
            isLoading
              ? "—"
              : `₹${Number(data?.totalIn ?? 0).toLocaleString("en-IN")}`
          }
          icon={<IndianRupee className="h-4 w-4 text-green-600" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Total Payment Out"
          value={
            isLoading
              ? "—"
              : `₹${Number(data?.totalOut ?? 0).toLocaleString("en-IN")}`
          }
          icon={<IndianRupee className="h-4 w-4 text-red-600" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Net Balance"
          value={
            isLoading
              ? "—"
              : `₹${Number((data?.totalIn ?? 0) - (data?.totalOut ?? 0)).toLocaleString("en-IN")}`
          }
          icon={<TrendingUp className="h-4 w-4 text-amber-600" />}
          isLoading={isLoading}
        />
        <StatCard
          title="Showing Page"
          value={isLoading ? "—" : `${currentPage} / ${totalPages || 1}`}
          icon={<History className="h-4 w-4" />}
          isLoading={isLoading}
        />
      </div>

      {/* ── Error ── */}
      {isError && (
        <Alert
          variant="destructive"
          className="border-rose-200 bg-rose-50 text-rose-800"
        >
          <AlertDescription>
            Transactions load karne mein dikkat aayi. Dobara try karo.
          </AlertDescription>
        </Alert>
      )}

      {/* ── Table ── */}
      <Card className="border-none shadow-md rounded-2xl bg-card/90">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[90px]">Type</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Perform By</TableHead>
                  <TableHead>Loan / Diary Ref</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Principal</TableHead>
                  <TableHead className="text-right">Interest</TableHead>
                  <TableHead className="text-right">Penalty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mode</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading &&
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 10 }).map((__, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}

                {!isLoading && (data?.data ?? []).length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={10}
                      className="text-center text-muted-foreground py-12"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <History className="h-8 w-8 text-muted-foreground/40" />
                        <p>Koi transaction nahi mili.</p>
                        <p className="text-xs">
                          Filters change karke dobara try karo.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {!isLoading &&
                  (data?.data ?? []).map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="hover:bg-indigo-50/40 transition-colors"
                    >
                      <TableCell>
                        <TypeBadge source={tx.source} type={tx.type} />
                      </TableCell>
                      <TableCell className="font-medium">
                        <p>{tx.customerName}</p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {tx.customerCode ?? "N/A"}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {tx.agentName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.loanAccountNumber ||
                        tx.diaryAccountCode ||
                        tx.diaryId ? (
                          <span className="font-mono text-xs bg-indigo-500/10 text-indigo-700 px-1.5 py-0.5 rounded">
                            {tx.loanAccountNumber ??
                              tx.diaryAccountCode ??
                              diaryCodeById.get(tx.diaryId ?? "")}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Diary</span>
                        )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold ${
                          tx.type.toLowerCase().includes("withdrawal") ||
                          tx.type.toLowerCase() === "disbursal" ||
                          tx.type.toLowerCase() === "debit"
                            ? "text-red-600"
                            : "text-green-600"
                        }`}
                      >
                        {fmt(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {fmt(tx.principalPart)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground text-sm">
                        {fmt(tx.interestPart)}
                      </TableCell>
                      <TableCell className="text-right text-red-500 text-sm">
                        {tx.penaltyPart && tx.penaltyPart > 0
                          ? fmt(tx.penaltyPart)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {fmtDate(tx.paymentDate)}
                      </TableCell>
                      <TableCell>
                        {tx.paymentMode ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] capitalize bg-slate-500/10 text-slate-700 border-slate-200"
                          >
                            {tx.paymentMode}
                          </Badge>
                        ) : (
                          <span className="text-slate-500 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            onClick={() =>
                              window.open(
                                `/receipt/${tx.id}?source=${tx.source}`,
                                "_blank",
                              )
                            }
                            title="Print Receipt"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          {role === "admin" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                disabled={!tx.loanId && !tx.diaryId}
                                onClick={() => setEditingTx(tx)}
                                title="Edit transaction"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                disabled={!tx.loanId && !tx.diaryId}
                                onClick={() => setDeletingTx(tx)}
                                title="Delete transaction"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {!isLoading && data && data.total > (filters.limit ?? 50) && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-gradient-to-r from-indigo-500/5 to-teal-500/5">
              <p className="text-xs text-slate-500">
                Showing {(currentPage - 1) * (filters.limit ?? 50) + 1}–
                {Math.min(currentPage * (filters.limit ?? 50), data.total)} of{" "}
                {data.total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page ?? 1) - 1,
                    }))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() =>
                    setFilters((prev) => ({
                      ...prev,
                      page: (prev.page ?? 1) + 1,
                    }))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {editingTx?.source === "loan" && editingTx.loanId && (
        <EditLoanTransactionModal
          open={!!editingTx}
          onClose={() => setEditingTx(null)}
          onSave={async (dto: EditTransactionFormData) => {
            await editLoanTransaction.mutateAsync({
              loanId: editingTx.loanId!,
              txId: editingTx.id,
              dto,
            });
            await refreshTransactions();
            setEditingTx(null);
          }}
          isPending={editLoanTransaction.isPending}
          transaction={toLoanTransaction(editingTx)}
        />
      )}

      {editingTx?.source === "diary" && editingTx.diaryId && (
        <EditDiaryTransactionModal
          open={!!editingTx}
          onClose={() => setEditingTx(null)}
          onSave={async (dto: EditDiaryTransactionFormData) => {
            await editDiaryTransaction.mutateAsync({
              accountId: editingTx.diaryId!,
              txId: editingTx.id,
              dto,
            });
            await refreshTransactions();
            setEditingTx(null);
          }}
          isPending={editDiaryTransaction.isPending}
          transaction={toDiaryTransaction(editingTx)}
        />
      )}

      <AlertDialog
        open={!!deletingTx}
        onOpenChange={(open) => !open && setDeletingTx(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected transaction and
              recalculate balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingTx(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={
                deleteLoanTransaction.isPending ||
                deleteDiaryTransaction.isPending
              }
              onClick={async () => {
                if (!deletingTx) return;
                if (deletingTx.source === "loan" && deletingTx.loanId) {
                  await deleteLoanTransaction.mutateAsync({
                    loanId: deletingTx.loanId,
                    txId: deletingTx.id,
                  });
                } else if (
                  deletingTx.source === "diary" &&
                  deletingTx.diaryId
                ) {
                  await deleteDiaryTransaction.mutateAsync({
                    accountId: deletingTx.diaryId,
                    txId: deletingTx.id,
                  });
                }
                await refreshTransactions();
                setDeletingTx(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
