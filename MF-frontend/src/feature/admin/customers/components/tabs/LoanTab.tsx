import { useState, useMemo } from "react";
import {
  CreditCard,
  Percent,
  CalendarDays,
  Clock,
  ShieldAlert,
  Receipt,
  ChevronRight,
  History,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MiniStat } from "./MiniStat";
import { formatCurrency, cn } from "@/lib/utils";
import { useLoanSchedule } from "../../hooks/useCustomerDetail";
import type { CustomerLoanSummary } from "@/feature/agent/types";
import { LoanDocumentsPanel } from "./LoanDocumentsPanel";

interface LoanTabProps {
  loanSummary?: CustomerLoanSummary;
  customerId: string;
}

export function LoanTab({ loanSummary, customerId }: LoanTabProps) {
  // 1. Manage selected loan state
  const loans = loanSummary?.loans || [];
  const defaultLoan = useMemo(
    () => loans.find((l) => l.status === "active") || loans[0],
    [loans],
  );

  const [selectedLoanId, setSelectedLoanId] = useState<string | undefined>(
    defaultLoan?.id,
  );

  // 2. Fetch schedule for the selected loan
  const { data: schedule, isLoading: loadingSchedule } =
    useLoanSchedule(selectedLoanId);

  const selectedLoan = useMemo(
    () => loans.find((l) => l.id === selectedLoanId),
    [loans, selectedLoanId],
  );

  if (!loanSummary || loans.length === 0) {
    return (
      <Card className="rounded-2xl border-dashed border-2 border-muted p-12 text-center bg-muted/5 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">
          No loan records
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto">
          इस customer का कोई loan record नहीं मिला
        </p>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return (
          <Badge
            variant="success"
            className="bg-success/10 text-success border-success/20 rounded-full px-2 py-0 text-[9px] font-black uppercase"
          >
            Active
          </Badge>
        );
      case "closed":
      case "paid":
        return (
          <Badge
            variant="outline"
            className="bg-muted/30 text-muted-foreground border-border/50 rounded-full px-2 py-0 text-[9px] font-black uppercase"
          >
            Closed
          </Badge>
        );
      case "overdue":
        return (
          <Badge
            variant="destructive"
            className="bg-destructive/10 text-destructive border-destructive/20 rounded-full px-2 py-0 text-[9px] font-black uppercase"
          >
            Overdue
          </Badge>
        );
      default:
        return (
          <Badge
            variant="warning"
            className="bg-warning/10 text-warning border-warning/20 rounded-full px-2 py-0 text-[9px] font-black uppercase"
          >
            Pending
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* ── Global Summary Stats ─────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="Total Disbursed"
          value={formatCurrency(loanSummary.totalDisbursed)}
          icon={Receipt}
          iconGradient="navy"
        />
        <MiniStat
          label="Total Paid"
          value={formatCurrency(loanSummary.totalPaid)}
          icon={Percent}
          iconGradient="green"
          color="text-green-600"
        />
        <MiniStat
          label="Total Outstanding"
          value={formatCurrency(loanSummary.totalOutstanding)}
          icon={Clock}
          iconGradient="amber"
          color="text-amber-600"
          accentLeft
        />
        <MiniStat
          label="Total Overdue"
          value={formatCurrency(loanSummary.totalOverdue)}
          icon={ShieldAlert}
          iconGradient="red"
          color="text-destructive"
        />
      </div>

      {/* ── Loan Selection Bar ──────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Loan Accounts ({loans.length})
          </h3>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {loans.map((loan) => (
            <button
              key={loan.id}
              onClick={() => setSelectedLoanId(loan.id)}
              className={cn(
                " shrink-0 w-48 p-4 rounded-xl border transition-all text-left relative overflow-hidden group",
                selectedLoanId === loan.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                  : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30",
              )}
            >
              {selectedLoanId === loan.id && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-xl flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-muted-foreground font-bold">
                    {loan.loanAccountNumber}
                  </span>
                  {getStatusBadge(loan.status)}
                </div>
                <div>
                  <p className="text-sm font-black text-foreground">
                    {formatCurrency(loan.principalAmount)}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    {loan.nextEmiDueDate
                      ? `Next: ${new Date(loan.nextEmiDueDate).toLocaleDateString()}`
                      : "No Due Date"}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Selected Loan Detail ────────────────────────── */}
      {selectedLoan ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-6 rounded-2xl bg-muted/20 border border-border/40 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black tracking-tight text-foreground">
                    {selectedLoan.loanAccountNumber}
                  </h3>
                  {getStatusBadge(selectedLoan.status)}
                </div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider flex items-center gap-2">
                  {selectedLoan.loanType === "emi"
                    ? "Fixed Monthly EMI"
                    : selectedLoan.loanType === "weekly"
                      ? "Weekly Installment"
                      : "Daily Installment"}
                  <span className="opacity-30">•</span>
                  {selectedLoan.totalEmis} Total Installments
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                    Outstanding
                  </p>
                  <p className="text-lg font-black text-foreground leading-none tabular-nums">
                    {formatCurrency(selectedLoan.remainingBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border/50 shadow-xs">
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1.5 tracking-wider">
                  Installment
                </p>
                <p className="text-lg font-black text-foreground">
                  {formatCurrency(
                    selectedLoan.emiAmount ||
                      selectedLoan.weeklyInstallment ||
                      selectedLoan.dailyInstallment ||
                      0,
                  )}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 shadow-xs">
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1.5 tracking-wider">
                  Overdue
                </p>
                <p className="text-lg font-black text-destructive">
                  {formatCurrency(selectedLoan.overdue)}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 shadow-xs">
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1.5 tracking-wider">
                  Paid / Total
                </p>
                <p className="text-lg font-black text-foreground">
                  {selectedLoan.emisPaid} / {selectedLoan.totalEmis}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-card border border-border/50 shadow-xs">
                <p className="text-[9px] font-black text-muted-foreground uppercase mb-1.5 tracking-wider">
                  Next Due
                </p>
                <p className="text-lg font-black text-foreground">
                  {selectedLoan.nextEmiDueDate
                    ? new Date(selectedLoan.nextEmiDueDate).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>
          </div>

          <LoanDocumentsPanel
            customerId={customerId}
            loanSummary={loanSummary}
          />

          <div className="bg-card rounded-2xl border border-border/50 overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
              <h3 className="text-xs font-black text-foreground uppercase tracking-widest flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary" />
                EMI Schedule
              </h3>
            </div>

            {loadingSchedule ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-bold text-muted-foreground uppercase">
                  Fetching Schedule...
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 border-b border-border/50">
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Emi #
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Due Date
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                        Amount
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Status
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Paid Date
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Receipt
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedule && schedule.length > 0 ? (
                      schedule.map((item: any, i: number) => (
                        <TableRow
                          key={i}
                          className="border-b border-border/20 last:border-0 hover:bg-muted/20 transition-colors"
                        >
                          <TableCell className="px-6 py-3 text-xs font-black text-foreground tabular-nums">
                            {item.emiNumber}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-xs font-medium text-muted-foreground">
                            {new Date(item.dueDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-right text-sm font-black text-foreground tabular-nums">
                            {formatCurrency(item.expectedAmount)}
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            {getStatusBadge(item.status)}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-xs font-medium text-muted-foreground">
                            {item.paidDate
                              ? new Date(item.paidDate).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-[10px] font-mono font-bold text-muted-foreground uppercase">
                            {item.receiptNo ?? "—"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <ShieldAlert className="w-8 h-8 text-muted-foreground/30" />
                            <p className="text-xs font-bold text-muted-foreground uppercase">
                              No schedule available
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border-2 border-muted p-12 text-center bg-muted/5">
          <p className="text-sm text-muted-foreground font-black uppercase tracking-tight">
            Select a loan to view details
          </p>
        </Card>
      )}
    </div>
  );
}
