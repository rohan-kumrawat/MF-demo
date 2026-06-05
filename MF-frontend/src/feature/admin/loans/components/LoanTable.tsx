// src/feature/admin/loans/components/LoanTable.tsx
import React from "react";
import {
  ChevronRight,
  Frown,
  AlertTriangle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { Loan } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDisplayDate } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// ─── Formatters ──────────────────────────────────────────────────────────────
const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));

function daysFromNow(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ─── Avatar Background Logic ──────────────────────────────────────────────────
const AVATAR_COLORS = [
  "bg-slate-900",
  "bg-emerald-700",
  "bg-blue-800",
  "bg-violet-600",
  "bg-amber-700",
  "bg-cyan-700",
];
function avatarBgClass(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

// ─── Status Styles ────────────────────────────────────────────────────────────
const getStatusConfig = (status: string, isOverdue: boolean) => {
  if (isOverdue) return { variant: "destructive" as const, label: "Overdue" };
  switch (status) {
    case "active":
      return { variant: "default" as const, label: "Active" };
    case "closed":
      return { variant: "secondary" as const, label: "Closed" };
    case "pre_closed":
      return { variant: "outline" as const, label: "Pre-Closed" };
    default:
      return { variant: "outline" as const, label: status };
  }
};

// ─── Next Due Cell ────────────────────────────────────────────────────────────
function NextDueCell({ dateStr }: { dateStr: string | null | undefined }) {
  if (!dateStr) return <span className="text-xs text-muted-foreground">—</span>;
  const days = daysFromNow(dateStr);
  const display = formatDisplayDate(dateStr);

  if (days < 0)
    return (
      <div className="flex items-center gap-1 text-destructive">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
        <div>
          <p className="text-[11px] font-bold leading-none">{display}</p>
          <p className="text-[10px] font-bold">{Math.abs(days)}d overdue</p>
        </div>
      </div>
    );

  if (days <= 7)
    return (
      <div className="flex items-center gap-1 text-amber-600">
        <Clock className="w-3.5 h-3.5 shrink-0" />
        <div>
          <p className="text-[11px] font-bold leading-none">{display}</p>
          <p className="text-[10px] font-bold">in {days}d</p>
        </div>
      </div>
    );

  return (
    <div>
      <p className="text-[11px] font-bold text-foreground leading-none">
        {display}
      </p>
      <p className="text-[10px] text-muted-foreground">in {days}d</p>
    </div>
  );
}

const PAGE_SIZE = 10;

interface Props {
  loans: Loan[];
  onSelect: (loan: Loan) => void;
  customerNames: Record<string, string>;
  error?: any;
  onClearFilters?: () => void;
}

export const LoanTable = React.memo(function LoanTable({
  loans,
  onSelect,
  customerNames,
  error,
  onClearFilters,
}: Props) {
  const [page, setPage] = React.useState(1);
  React.useEffect(() => setPage(1), [loans]);

  if (loans.length === 0 && !error) {
    return (
      <div className="bg-card/90 rounded-2xl border border-cyan-100/70 shadow-sm flex flex-col items-center justify-center py-20 text-center">
        <Frown className="w-12 h-12 text-cyan-500/40 mb-3" />
        <p className="text-sm font-bold text-foreground">कोई loan नहीं मिला</p>
        <p className="text-xs text-slate-500 mt-1">
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(loans.length / PAGE_SIZE));
  const paginated = loans.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-card/90 rounded-2xl border border-cyan-100/70 shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-violet-500/5">
          <TableRow>
            <TableHead className="text-[10px] font-black uppercase tracking-widest px-5 text-cyan-700">
              Borrower
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              Account
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right text-cyan-700">
              Principal
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right text-cyan-700">
              EMI / mo
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-right text-cyan-700">
              Outstanding
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              Progress
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              Next Due
            </TableHead>
            <TableHead className="text-[10px] font-black uppercase tracking-widest text-cyan-700">
              Status
            </TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {error ? (
            <TableRow>
              <TableCell colSpan={9} className="py-20 text-center">
                <div className="flex justify-center px-4">
                  <Alert
                    variant="destructive"
                    className="max-w-md border-dashed bg-rose-50 animate-in fade-in zoom-in-95 duration-500 text-left border-rose-200 text-rose-800"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="font-black">
                      Failed to load loans
                    </AlertTitle>
                    <AlertDescription className="space-y-4 mt-2">
                      <p className="text-sm opacity-90">
                        There was an error fetching the data. Try clearing your
                        filters or refreshing the page.
                      </p>
                      {onClearFilters && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={onClearFilters}
                          className="w-full sm:w-auto font-bold border-rose-200 text-rose-700 hover:bg-rose-600 hover:text-white transition-all active:scale-95"
                        >
                          Remove all filters
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            paginated.map((loan) => {
              const customerName =
                loan.customer?.name ??
                customerNames[loan.customerId] ??
                "Unknown";
              const customerPhone = loan.customer?.phone ?? "";
              const isOverdue = (loan.overdue ?? 0) > 0;
              const statusConfig = getStatusConfig(loan.status, isOverdue);
              const emisPaid = loan.emisPaid ?? 0;
              const totalEmis = loan.totalEmis ?? loan.tenureMonths ?? 0;
              const installmentLabel =
                loan.loanType === "emi"
                  ? "EMIs"
                  : loan.loanType === "weekly"
                    ? "WEEKS"
                    : "DAYS";
              const installmentAmount =
                loan.emiAmount ??
                loan.weeklyInstallment ??
                loan.dailyInstallment ??
                0;
              const progressValue =
                totalEmis > 0 ? (emisPaid / totalEmis) * 100 : 0;

              return (
                <TableRow
                  key={loan.id}
                  className="group cursor-pointer hover:bg-cyan-50/50"
                  onClick={() => onSelect(loan)}
                >
                  <TableCell className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-9 h-9 rounded-xl border border-cyan-100 shadow-sm">
                        <AvatarFallback
                          className={
                            avatarBgClass(customerName) +
                            " text-white text-xs font-black"
                          }
                        >
                          {customerName[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-bold text-foreground text-sm leading-tight whitespace-nowrap">
                          {customerName}
                        </p>
                        {customerPhone && (
                          <p className="text-[10px] text-muted-foreground font-medium">
                            {customerPhone}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <p className="font-mono text-xs text-muted-foreground font-bold whitespace-nowrap">
                      {loan.loanAccountNumber}
                    </p>
                    <Badge
                      variant="outline"
                      className="mt-1 text-[9px] h-4 font-black uppercase tracking-wide bg-primary/5 text-primary border-primary/20"
                    >
                      {loan.loanType}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-black text-foreground text-sm">
                      {fmt(loan.principalAmount)}
                    </span>
                    <p className="text-[10px] text-muted-foreground">
                      {Number(loan.interestRate)}% p.a.
                    </p>
                  </TableCell>

                  <TableCell className="text-right">
                    <span className="font-bold text-muted-foreground text-sm">
                      {fmt(installmentAmount)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <span
                      className={
                        isOverdue
                          ? "font-black text-sm text-destructive"
                          : "font-black text-sm text-foreground"
                      }
                    >
                      {fmt(loan.remainingBalance)}
                    </span>
                    {isOverdue && (
                      <p className="text-[10px] font-bold text-destructive whitespace-nowrap">
                        ₹{Number(loan.overdue).toLocaleString("en-IN")} overdue
                      </p>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col gap-1.5 min-w-[100px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {emisPaid}/{totalEmis} {installmentLabel}
                        </span>
                        <span className="text-[10px] font-black text-primary">
                          {Math.round(progressValue)}%
                        </span>
                      </div>
                      <Progress value={progressValue} className="h-1.5" />
                    </div>
                  </TableCell>

                  <TableCell>
                    <NextDueCell dateStr={loan.nextEmiDueDate} />
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={statusConfig.variant}
                      className="text-[10px] font-black uppercase px-2.5 py-0.5"
                    >
                      {statusConfig.label}
                    </Badge>
                  </TableCell>

                  <TableCell className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="border-t border-border/50 bg-muted/20 px-4 py-3">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className={
                    page === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* Simplified pagination logic for many pages */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <PaginationItem key={p} className="hidden sm:inline-block">
                  <PaginationLink
                    onClick={() => setPage(p)}
                    isActive={page === p}
                    className="cursor-pointer"
                  >
                    {p}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  className={
                    page === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
});
