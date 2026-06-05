import { useState, useRef, useMemo } from "react";
import {
  BookOpen,
  Wallet,
  CalendarDays,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  History,
  Download,
  Plus,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { ReceiptModal } from "@/components/ReceiptModal";
import { MiniStat } from "./MiniStat";
import { formatCurrency, cn, formatDisplayDate, localToday } from "@/lib/utils";
import { useComponentShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  useCustomerDiaryAccounts,
  useCustomerDiaryAccountTransactions,
  useCustomerDiaryAccountMutation,
} from "../../hooks/useCustomerDetail";

interface DiaryAccountsTabProps {
  customerId: string;
}

export function DiaryAccountsTab({ customerId }: DiaryAccountsTabProps) {
  const { data: accounts = [], isLoading } =
    useCustomerDiaryAccounts(customerId);

  const defaultAccount = useMemo(
    () => accounts.find((a) => a.isActive) || accounts[0],
    [accounts],
  );

  const [selectedId, setSelectedId] = useState<string | undefined>(
    defaultAccount?.id,
  );

  const { data: transactions = [], isLoading: loadingTransactions } =
    useCustomerDiaryAccountTransactions(selectedId!);

  const selectedAccount = useMemo(
    () => accounts.find((a) => a.id === selectedId) ?? defaultAccount,
    [accounts, selectedId, defaultAccount],
  );

  // ── Aggregate stats ────────────────────────────────────────
  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + parseFloat(a.balance || "0"), 0),
    [accounts],
  );
  const activeCount = useMemo(
    () => accounts.filter((a) => a.isActive).length,
    [accounts],
  );
  const inactiveCount = accounts.length - activeCount;

  // ── Transaction table state ────────────────────────────────
  const [activeRow, setActiveRow] = useState(0);
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMode, setDepositMode] = useState("cash");
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const depositMutation = useCustomerDiaryAccountMutation(
    customerId,
    selectedId,
  );

  const onDownload = (tx: any) => {
    setReceiptData({
      receiptNo: tx.receiptNo || tx.id.slice(0, 8).toUpperCase(),
      date: tx.transactionDate,
      from: selectedAccount?.customer?.name ?? "",
      accountNo: selectedAccount?.id ?? "",
      amount: Number(tx.amount),
      mode: tx.paymentMode || "Cash",
      towards:
        tx.type.toLowerCase() === "deposit" ? "Diary Deposit" : "Withdrawal",
      balanceAfter: Number(tx.balanceAfter),
      collector: "Agent",
    });
    setReceiptOpen(true);
  };

  useComponentShortcuts(
    "diary-accounts-table",
    [
      {
        key: "ArrowDown",
        action: () =>
          setActiveRow((r) => Math.min(r + 1, transactions.length - 1)),
        description: "Next row",
      },
      {
        key: "ArrowUp",
        action: () => setActiveRow((r) => Math.max(r - 1, 0)),
        description: "Previous row",
      },
      {
        key: "r",
        action: () => {
          if (transactions[activeRow]) onDownload(transactions[activeRow]);
        },
        description: "Download receipt",
      },
    ],
    tableRef,
  );

  const handleDepositSubmit = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) return;
    try {
      await depositMutation.mutateAsync({
        amount: Number(depositAmount),
        transactionDate: localToday(),
        notes: `Mode: ${depositMode}`,
      });
      setDepositAmount("");
      setDepositOpen(false);
    } catch (error) {
      console.error("Deposit failed", error);
    }
  };

  // ── Loading state ──────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
          Loading diary accounts…
        </p>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────
  if (!accounts.length) {
    return (
      <Card className="rounded-2xl border-dashed border-2 border-muted p-12 text-center bg-muted/5 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">
          No Diary Accounts
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[250px] mx-auto">
          इस customer का कोई diary/savings account नहीं मिला
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* ── Summary Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStat
          label="Total Balance"
          value={formatCurrency(totalBalance)}
          icon={Wallet}
          iconGradient="green"
          color="text-green-600"
          accentLeft
        />
        <MiniStat
          label="Total Accounts"
          value={String(accounts.length)}
          icon={BookOpen}
          iconGradient="navy"
        />
        <MiniStat
          label="Active"
          value={String(activeCount)}
          icon={CheckCircle2}
          iconGradient="green"
          color="text-green-600"
        />
        <MiniStat
          label="Inactive"
          value={String(inactiveCount)}
          icon={XCircle}
          iconGradient="red"
          color="text-destructive"
        />
      </div>

      {/* ── Account Selection Cards ─────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-[11px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <History className="w-3.5 h-3.5" />
          Diary Accounts ({accounts.length})
        </h3>

        <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-1 px-1">
          {accounts.map((account) => (
            <button
              key={account.id}
              onClick={() => setSelectedId(account.id)}
              className={cn(
                "shrink-0 w-52 p-4 rounded-xl border transition-all text-left relative overflow-hidden group",
                selectedId === account.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                  : "border-border/50 bg-card hover:border-primary/30 hover:bg-muted/30",
              )}
            >
              {selectedId === account.id && (
                <div className="absolute top-0 right-0 w-8 h-8 bg-primary/10 rounded-bl-xl flex items-center justify-center">
                  <ChevronRight className="w-4 h-4 text-primary" />
                </div>
              )}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <Badge
                    variant={account.isActive ? "success" : "outline"}
                    className={cn(
                      "rounded-full px-2 py-0 text-[9px] font-black uppercase",
                      account.isActive
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-muted/30 text-muted-foreground border-border/50",
                    )}
                  >
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm font-black text-foreground leading-tight line-clamp-2">
                  {account.diaryName}
                </p>
                <p className="text-base font-black text-primary tabular-nums">
                  {formatCurrency(parseFloat(account.balance))}
                </p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                  Since:{" "}
                  {new Date(account.cycleStartDate).toLocaleDateString(
                    "en-IN",
                    { day: "2-digit", month: "short", year: "numeric" },
                  )}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Selected Account Detail ─────────────────────────────── */}
      {selectedAccount ? (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-6 rounded-2xl bg-muted/20 border border-border/40 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xl font-black tracking-tight text-foreground">
                    {selectedAccount.diaryName}
                  </h3>
                  <Badge
                    variant={selectedAccount.isActive ? "success" : "outline"}
                    className={cn(
                      "rounded-full px-2 py-0 text-[9px] font-black uppercase",
                      selectedAccount.isActive
                        ? "bg-success/10 text-success border-success/20"
                        : "bg-muted/30 text-muted-foreground border-border/50",
                    )}
                  >
                    {selectedAccount.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
                  {selectedAccount.customer.name} ·{" "}
                  {selectedAccount.customer.customerCode}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[10px] font-black text-muted-foreground uppercase leading-none mb-1">
                  Current Balance
                </p>
                <p className="text-2xl font-black text-primary leading-none tabular-nums">
                  {formatCurrency(parseFloat(selectedAccount.balance))}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <DetailCard
                label="Cycle Start"
                value={formatDisplayDate(selectedAccount.cycleStartDate)}
                icon={<CalendarDays className="w-4 h-4 text-primary" />}
              />
              <DetailCard
                label="Last Withdrawal"
                value={
                  selectedAccount.lastWithdrawalDate
                    ? formatDisplayDate(selectedAccount.lastWithdrawalDate)
                    : "No withdrawals yet"
                }
                icon={<Clock className="w-4 h-4 text-amber-500" />}
              />
              <DetailCard
                label="Created On"
                value={formatDisplayDate(selectedAccount.createdAt)}
                icon={<BookOpen className="w-4 h-4 text-muted-foreground" />}
              />
              <DetailCard
                label="Last Updated"
                value={new Date(selectedAccount.updatedAt).toLocaleDateString(
                  "en-IN",
                  { day: "2-digit", month: "short", year: "numeric" },
                )}
                icon={<History className="w-4 h-4 text-muted-foreground" />}
              />
            </div>

            <div className="pt-2 border-t border-border/30">
              <p className="text-[10px] font-mono text-muted-foreground/60 break-all">
                Account ID: {selectedAccount.accountCode || "N/A"}
              </p>
            </div>
          </div>

          {/* ── Transaction Table ─────────────────────────────────── */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-muted/20">
              <h3 className="text-sm font-bold text-foreground">
                Transactions
              </h3>
              <Button
                size="sm"
                onClick={() => setDepositOpen(true)}
                className="rounded-lg font-bold gap-2"
              >
                <Plus className="w-4 h-4" /> Add Deposit
              </Button>
            </div>

            <div
              ref={tableRef}
              tabIndex={0}
              className="overflow-x-auto outline-none focus:ring-2 focus:ring-primary/10"
            >
              {loadingTransactions ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50 border-b border-border/50">
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Receipt No
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Mode
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                        In
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                        Out
                      </TableHead>
                      <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                        Balance
                      </TableHead>
                      <TableHead className="px-6 h-10 w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-sm text-muted-foreground"
                        >
                          No transactions found
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx: any, i: number) => (
                        <TableRow
                          key={tx.id || i}
                          onClick={() => setActiveRow(i)}
                          className={`cursor-pointer transition-colors border-b border-border/30 last:border-0 ${
                            i === activeRow
                              ? "bg-primary/5"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <TableCell className="px-6 py-3 text-xs font-medium text-muted-foreground">
                            {new Date(tx.transactionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-[11px] font-mono text-muted-foreground">
                            {tx.receiptNo || "-"}
                          </TableCell>
                          <TableCell className="px-6 py-3">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold border-primary/20 text-primary bg-primary/5"
                            >
                              {tx.paymentMode}
                            </Badge>
                          </TableCell>
                          <TableCell className="px-6 py-3 text-right text-sm font-bold text-success tabular-nums">
                            {tx.type.toLowerCase() === "deposit"
                              ? formatCurrency(Number(tx.amount))
                              : "—"}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-right text-sm font-bold text-destructive tabular-nums">
                            {tx.type.toLowerCase().includes("withdraw")
                              ? formatCurrency(Number(tx.amount))
                              : "—"}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-right text-sm font-bold text-foreground tabular-nums">
                            {formatCurrency(Number(tx.balanceAfter))}
                          </TableCell>
                          <TableCell className="px-6 py-3 text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDownload(tx);
                              }}
                              className="h-8 w-8 text-muted-foreground hover:text-primary rounded-lg"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border-2 border-muted p-12 text-center bg-muted/5">
          <p className="text-sm text-muted-foreground font-black uppercase tracking-tight">
            Select an account to view details
          </p>
        </Card>
      )}

      {/* ── Deposit Dialog ─────────────────────────────────────── */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add Deposit</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Amount (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="h-11 font-bold text-lg"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Payment Mode
              </label>
              <Select value={depositMode} onValueChange={setDepositMode}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg border-border/50">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDepositOpen(false)}
              className="rounded-xl font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDepositSubmit}
              disabled={depositMutation.isPending}
              className="rounded-xl font-bold"
            >
              {depositMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Confirm Deposit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReceiptModal
        open={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        data={receiptData}
      />
    </div>
  );
}

// ── Reusable detail card ─────────────────────────────────────────
function DetailCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl bg-card border border-border/50 shadow-xs space-y-2">
      <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <p className="text-sm font-black text-foreground leading-snug">{value}</p>
    </div>
  );
}
