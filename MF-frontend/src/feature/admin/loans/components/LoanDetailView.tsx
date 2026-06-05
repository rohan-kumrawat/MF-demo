import React, { useState } from "react";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  CreditCard,
  TrendingDown,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  IndianRupee,
  Lock,
  RotateCcw,
  Briefcase,
  Users,
  User2,
  Pencil,
  Trash2,
  RefreshCw,
  Printer,
} from "lucide-react";
import {
  useLoan,
  useLoanSchedule,
  useLoanTransactions,
  useLoanMutations,
  useEditLoanTransaction,
  useDeleteLoanTransaction,
  useDeleteLoan,
} from "../hooks/useLoans";
import { RecordPaymentModal } from "./RecordPaymentModal";
import { PreCloseLoanModal } from "./PreCloseLoanModal";
import { DeleteLoanModal } from "./DeleteLoanModal";
import { ReverseTransactionModal } from "./ReverseTransactionModal";
import { EditTransactionModal } from "./EditTransactionModal";
import { DeleteTransactionModal } from "./DeleteTransactionModal";
import { RenewBulletLoanModal } from "./RenewBulletLoanModal";
import { ApplyBulletPenaltyModal } from "./ApplyBulletPenaltyModal";
import { EditLoanModal } from "./EditLoanModal";
import { useAuthStore } from "@/store/authStore";
import type { Loan, Transaction, EditTransactionDto } from "../types";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));

const SCHEDULE_STATUS_MAP: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
  }
> = {
  paid: {
    label: "Paid",
    variant: "default",
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  partial: {
    label: "Partial",
    variant: "secondary",
    icon: <Clock className="w-3 h-3" />,
  },
  pending: {
    label: "Pending",
    variant: "outline",
    icon: <Clock className="w-3 h-3" />,
  },
  overdue: {
    label: "Overdue",
    variant: "destructive",
    icon: <AlertTriangle className="w-3 h-3" />,
  },
};

interface Props {
  loan: Loan;
  customerName: string;
  onBack: () => void;
}

export function LoanDetailView({ loan, customerName, onBack }: Props) {
  const { data: loanDetail } = useLoan(loan.id);
  const { data: schedule = [], isLoading: scheduleLoading } = useLoanSchedule(
    loan.id,
  );
  const { data: transactions = [], isLoading: txLoading } = useLoanTransactions(
    loan.id,
  );
  const {
    addTransaction,
    preClose,
    reverseTransaction,
    renewBullet,
    applyBulletPenalty,
    isAddingTransaction,
    isPreClosing,
    isReversing,
    isRenewingBullet,
    isApplyingPenalty,
  } = useLoanMutations();
  const editTransaction = useEditLoanTransaction();
  const deleteTransaction = useDeleteLoanTransaction();
  const deleteLoanMut = useDeleteLoan();
  const installmentAmount = Number(
    loan.emiAmount ?? loan.weeklyInstallment ?? loan.dailyInstallment ?? 0,
  );
  const installmentLabel =
    loan.loanType === "emi"
      ? "EMI / Month"
      : loan.loanType === "weekly"
        ? "Weekly Installment"
        : "Daily Installment";

  const role = useAuthStore((s) => s.role);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [editLoanOpen, setEditLoanOpen] = useState(false);
  const [preCloseOpen, setPreCloseOpen] = useState(false);
  const [deleteLoanOpen, setDeleteLoanOpen] = useState(false);
  const [renewBulletOpen, setRenewBulletOpen] = useState(false);
  const [applyPenaltyOpen, setApplyPenaltyOpen] = useState(false);
  const [reverseTarget, setReverseTarget] = useState<Transaction | null>(null);
  const [editTarget, setEditTarget] = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  const currentLoan = loanDetail ?? loan;
  const remaining = Number(currentLoan.remainingBalance);
  const totalPayable = Number(currentLoan.totalPayable);
  const paidPct =
    totalPayable > 0
      ? Math.round(((totalPayable - remaining) / totalPayable) * 100)
      : 0;

  const handlePayment = async (
    dto: Parameters<typeof addTransaction.mutateAsync>[0]["dto"],
  ) => {
    await addTransaction.mutateAsync({ loanId: loan.id, dto });
    setPaymentOpen(false);
  };

  const handlePreClose = async (notes: string) => {
    await preClose.mutateAsync({ id: loan.id, notes });
    setPreCloseOpen(false);
  };

  const handleReverseTransaction = async (notes: string) => {
    if (!reverseTarget) return;
    await reverseTransaction.mutateAsync({
      loanId: loan.id,
      txId: reverseTarget.id,
      notes,
    });
    setReverseTarget(null);
  };

  const handleEditTransaction = async (dto: EditTransactionDto) => {
    if (!editTarget) return;
    await editTransaction.mutateAsync({
      loanId: loan.id,
      txId: editTarget.id,
      dto,
    });
    setEditTarget(null);
  };

  const handleDeleteTransaction = async () => {
    if (!deleteTarget) return;
    await deleteTransaction.mutateAsync({
      loanId: loan.id,
      txId: deleteTarget.id,
    });
    setDeleteTarget(null);
  };

  const handleRenewBullet = async (
    dto: Parameters<typeof renewBullet.mutateAsync>[0]["dto"],
  ) => {
    await renewBullet.mutateAsync({ id: loan.id, dto });
    setRenewBulletOpen(false);
  };

  const handleApplyPenalty = async (notes: string) => {
    await applyBulletPenalty.mutateAsync({ id: loan.id, dto: { notes } });
    setApplyPenaltyOpen(false);
  };

  const handleDeleteLoan = async () => {
    await deleteLoanMut.mutateAsync(loan.id);
    setDeleteLoanOpen(false);
    onBack();
  };

  return (
    <div className="flex flex-col p-2 md:p-4 gap-4 animate-in fade-in duration-500">
      {/* Header Row */}

      {/* Main Loan Identity Card */}
      <Card className="border-muted-foreground/10 shadow-sm overflow-hidden rounded-2xl">
        <CardContent className="px-3 md:px-4">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 h-9 px-0 text-muted-foreground hover:text-foreground hover:bg-transparent font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Loans
            </Button>

            <div className="flex items-center gap-2">
              {currentLoan.status === "active" && role === "admin" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditLoanOpen(true)}
                    className="h-9 px-4 gap-2 text-md font-bold border-slate-200 text-slate-700 hover:bg-slate-100 transition-all rounded-lg"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreCloseOpen(true)}
                    className="h-9 px-4 gap-2 text-md font-bold border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive transition-all rounded-lg"
                  >
                    <Lock className="w-3.5 h-3.5" /> Pre-close
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteLoanOpen(true)}
                    className="h-9 px-4 gap-2 text-md font-bold border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all rounded-lg"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </>
              )}

              {currentLoan.status === "active" &&
                currentLoan.loanType === "bullet" && (
                  <>
                    {role === "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setApplyPenaltyOpen(true)}
                        className="h-9 px-4 gap-2 text-md font-bold border-destructive text-destructive hover:bg-destructive/10 transition-all rounded-lg"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" /> Apply Penalty
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRenewBulletOpen(true)}
                      className="h-9 px-4 gap-2 text-md font-bold border-primary text-primary hover:bg-primary/10 transition-all rounded-lg"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Renew
                    </Button>
                  </>
                )}

              {currentLoan.status === "active" && (
                <Button
                  size="sm"
                  onClick={() => setPaymentOpen(true)}
                  className="h-9 px-4 gap-2 text-md font-black shadow-md shadow-primary/10 hover:scale-[1.02] active:scale-[0.98] transition-all rounded-lg"
                >
                  <IndianRupee className="w-3.5 h-3.5" strokeWidth={3} /> Record
                  Payment
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {/* Avatar Box */}
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 shadow-inner shrink-0">
                <User2 className="w-6 h-6" strokeWidth={1.5} />
              </div>

              {/* Details Column */}
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-[11px] font-black uppercase tracking-widest text-muted-foreground/70">
                    LOAN ID: {currentLoan.loanAccountNumber}
                  </span>
                </div>
                <h1 className="text-lg font-black tracking-tight text-foreground mb-0.5">
                  {customerName}
                </h1>
                <div className="flex items-center flex-wrap justify-center md:justify-start gap-2 text-xs text-muted-foreground font-medium">
                  <div className="w-1 h-4 border-l border-muted-foreground/20 hidden md:block" />
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 opacity-70" />
                    {currentLoan.loanType.toUpperCase()} LOAN
                  </div>
                  <div className="w-1 h-4 border-l border-muted-foreground/20 hidden md:block" />
                  <Badge
                    variant="outline"
                    className="rounded-full px-3 py-0 h-6 text-[10px] font-black uppercase tracking-wider border-primary/20 text-primary bg-primary/5"
                  >
                    {currentLoan.emiPaymentMode}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center md:items-end justify-center h-full">
              <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground mb-0.5">
                REMAINING BALANCE
              </p>
              <h2 className="text-2xl font-black text-emerald-600 tracking-tight tabular-nums">
                {fmt(currentLoan.remainingBalance)}
              </h2>
            </div>
          </div>

          {/* Repayment Progress (Integrated) */}
          <div className="mt-4 pt-3 border-t border-muted-foreground/10">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1.5">
              <span className="text-muted-foreground">Repayment Progress</span>
              <span className="text-primary">{paidPct}% COMPLETED</span>
            </div>
            <Progress value={paidPct} className="h-1.5 bg-muted/50" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          label="Principal"
          value={fmt(currentLoan.principalAmount)}
          icon={<CreditCard className="w-4 h-4" />}
        />
        <MetricCard
          label={installmentLabel}
          value={fmt(installmentAmount)}
          icon={<Calendar className="w-4 h-4" />}
        />
        <MetricCard
          label="Remaining"
          value={fmt(currentLoan.remainingBalance)}
          icon={<TrendingDown className="w-4 h-4" />}
        />
        <MetricCard
          label="Next Due"
          value={currentLoan.nextEmiDueDate ?? "—"}
          icon={<Clock className="w-4 h-4" />}
        />
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full h-9">
          <TabsTrigger value="overview" className="data-[state=active]:bg-card">
            Overview
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-card">
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-card"
          >
            Transactions
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4">
          <OverviewTab loan={currentLoan} />
        </TabsContent>
        <TabsContent value="schedule" className="mt-4">
          <ScheduleTab schedule={schedule} isLoading={scheduleLoading} />
        </TabsContent>
        <TabsContent value="transactions" className="mt-4">
          <TransactionsTab
            transactions={transactions}
            isLoading={txLoading}
            role={role}
            onReverse={(tx) => setReverseTarget(tx)}
            onEdit={(tx) => setEditTarget(tx)}
            onDelete={(tx) => setDeleteTarget(tx)}
          />
        </TabsContent>
      </Tabs>

      <EditLoanModal
        isOpen={editLoanOpen}
        onClose={() => setEditLoanOpen(false)}
        loan={currentLoan}
      />

      <RecordPaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onSave={handlePayment}
        isPending={isAddingTransaction}
        remainingBalance={Number(currentLoan.remainingBalance)}
        emiAmount={Number(
          currentLoan.emiAmount ??
            currentLoan.weeklyInstallment ??
            currentLoan.dailyInstallment ??
            0,
        )}
      />

      <PreCloseLoanModal
        open={preCloseOpen}
        onClose={() => setPreCloseOpen(false)}
        onConfirm={handlePreClose}
        isPending={isPreClosing}
        loanAccountNumber={currentLoan.loanAccountNumber}
        remainingBalance={Number(currentLoan.remainingBalance)}
      />

      <RenewBulletLoanModal
        open={renewBulletOpen}
        onClose={() => setRenewBulletOpen(false)}
        onSave={handleRenewBullet}
        isPending={isRenewingBullet}
      />

      <ApplyBulletPenaltyModal
        open={applyPenaltyOpen}
        onClose={() => setApplyPenaltyOpen(false)}
        onSave={handleApplyPenalty}
        isPending={isApplyingPenalty}
      />

      <DeleteLoanModal
        open={deleteLoanOpen}
        onClose={() => setDeleteLoanOpen(false)}
        onConfirm={handleDeleteLoan}
        isPending={deleteLoanMut.isPending}
        loanAccountNumber={currentLoan.loanAccountNumber}
      />

      <ReverseTransactionModal
        open={!!reverseTarget}
        onClose={() => setReverseTarget(null)}
        onConfirm={handleReverseTransaction}
        isPending={isReversing}
        transaction={reverseTarget}
      />

      <EditTransactionModal
        key={editTarget?.id}
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        onSave={handleEditTransaction}
        isPending={editTransaction.isPending}
        transaction={editTarget}
      />

      <DeleteTransactionModal
        key={deleteTarget?.id}
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteTransaction}
        isPending={deleteTransaction.isPending}
        transaction={deleteTarget}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-3 flex flex-col items-center gap-1">
        <div className="p-2 bg-muted rounded-md text-muted-foreground">
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </p>
          <p className="text-base font-bold leading-none mt-1">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewTab({ loan }: { loan: Loan }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />
            Business Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-xs pt-3 px-4 pb-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Purpose</span>
            <span className="font-medium capitalize">
              {loan.purposeOfLoan || "—"}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Disbursed Amount</span>
            <span className="font-medium">{fmt(loan.disbursedAmount)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Total Payable</span>
            <span className="font-medium">{fmt(loan.totalPayable)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">File Charge</span>
            <span className="font-medium">{fmt(loan.fileCharge)}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Other Charges</span>
            <span className="font-medium">{fmt(loan.otherCharge)}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-1 pt-3 px-4">
          <CardTitle className="text-xs font-bold flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
            Timeline & Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-1.5 text-xs pt-3 px-4 pb-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Start Date</span>
            <span className="font-medium">{loan.startDate || "—"}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">End Date</span>
            <span className="font-medium">{loan.endDate || "—"}</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Tenure</span>
            <span className="font-medium">{loan.tenureMonths} Months</span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Interest Rate</span>
            <span className="font-medium">{Number(loan.interestRate)}%</span>
          </div>
        </CardContent>
      </Card>

      {loan.guarantors && loan.guarantors.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Guarantors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2 pb-3">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="h-8">
                    <TableHead className="text-[11px] h-8">Name</TableHead>
                    <TableHead className="text-[11px] h-8">Phone</TableHead>
                    <TableHead className="text-[11px] h-8">Relation</TableHead>
                    <TableHead className="text-[11px] h-8">Aadhar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loan.guarantors.map((g, i) => (
                    <TableRow key={i} className="h-8">
                      <TableCell className="font-medium py-1 text-xs">
                        {g.name}
                      </TableCell>
                      <TableCell className="py-1 text-xs">{g.phone}</TableCell>
                      <TableCell className="capitalize py-1 text-xs">
                        {g.relation}
                      </TableCell>
                      <TableCell className="py-1 text-xs">
                        {g.aadharNumber}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScheduleTab({
  schedule,
  isLoading,
}: {
  schedule: any[];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <Table className="overflow-x-auto">
        <TableHeader>
          <TableRow className="h-9">
            <TableHead className="w-[40px] h-9 text-[11px]">#</TableHead>
            <TableHead className="h-9 text-[11px]">Due Date</TableHead>
            <TableHead className="h-9 text-[11px]">Amount</TableHead>
            <TableHead className="h-9 text-[11px]">Principal</TableHead>
            <TableHead className="h-9 text-[11px]">Interest</TableHead>
            <TableHead className="h-9 text-[11px]">Status</TableHead>
            <TableHead className="h-9 text-[11px]">Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {schedule.map((item, idx) => {
            const s =
              SCHEDULE_STATUS_MAP[item.status] ?? SCHEDULE_STATUS_MAP.pending;
            const rowNumber =
              item.emiNumber ??
              item.installmentNumber ??
              item.dayNumber ??
              idx + 1;
            return (
              <TableRow
                key={`${rowNumber}-${item.dueDate ?? idx}`}
                className="h-9"
              >
                <TableCell className="font-medium py-1 text-xs">
                  {rowNumber}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {item.dueDate ?? "—"}
                </TableCell>
                <TableCell className="font-bold py-1 text-xs">
                  {fmt(item.expectedAmount)}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {fmt(item.breakup?.principal ?? 0)}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {fmt(item.breakup?.interest ?? 0)}
                </TableCell>
                <TableCell className="py-1">
                  <Badge
                    variant={s.variant}
                    className="gap-1 px-1.5 py-0 text-[9px] h-5"
                  >
                    {s.icon} {s.label}
                  </Badge>
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground py-1">
                  {item.receiptNo ?? "—"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}

function TransactionsTab({
  transactions,
  isLoading,
  role,
  onReverse,
  onEdit,
  onDelete,
}: {
  transactions: Transaction[];
  isLoading: boolean;
  role: string;
  onReverse: (tx: Transaction) => void;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center py-12 text-center text-muted-foreground">
          <XCircle className="w-10 h-10 mb-3 opacity-20" />
          <p className="text-sm font-medium">No transactions yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="h-9">
              <TableHead className="h-9 text-[11px]">Date</TableHead>
              <TableHead className="h-9 text-[11px]">Type</TableHead>
              <TableHead className="h-9 text-[11px]">Amount</TableHead>
              <TableHead className="h-9 text-[11px]">Principal</TableHead>
              <TableHead className="h-9 text-[11px]">Interest</TableHead>
              <TableHead className="h-9 text-[11px]">Diary</TableHead>
              <TableHead className="h-9 text-[11px]">Mode</TableHead>
              <TableHead className="h-9 text-[11px]">Receipt</TableHead>
              <TableHead className="w-[120px] h-9 text-[11px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow
                key={tx.id}
                className={`h-9 ${tx.isReversed ? "opacity-50" : ""}`}
              >
                <TableCell className="whitespace-nowrap py-1 text-xs">
                  {tx.paymentDate}
                </TableCell>
                <TableCell className="py-1">
                  <Badge
                    variant="outline"
                    className="uppercase text-[9px] h-5 px-1.5"
                  >
                    {tx.type.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell
                  className={`font-bold py-1 text-xs ${tx.isReversed ? "line-through" : ""}`}
                >
                  {fmt(tx.amount)}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {fmt(tx.principalPart)}
                </TableCell>
                <TableCell className="py-1 text-xs">
                  {fmt(tx.interestPart)}
                </TableCell>
                <TableCell className="font-medium py-1 text-xs">
                  {tx.diaryAmount ? fmt(tx.diaryAmount) : "—"}
                </TableCell>
                <TableCell className="uppercase text-[10px] font-medium text-muted-foreground py-1">
                  {tx.paymentMode}
                </TableCell>
                <TableCell className="font-mono text-[10px] text-muted-foreground py-1">
                  {tx.receiptNo}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(`/receipt/${tx.id}?source=loan`, "_blank");
                      }}
                      className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-muted"
                      title="Print Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                    {!tx.isReversed && role === "admin" && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEdit(tx);
                          }}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                          title="Edit transaction"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onReverse(tx);
                          }}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
                          title="Reverse transaction"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(tx);
                          }}
                          className="h-8 w-8 text-destructive hover:bg-destructive/10"
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
    </Card>
  );
}
