// src/feature/admin/diary/components/DiaryDetailView.tsx
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Plus,
  Minus,
  ReceiptText,
  TrendingUp,
  Phone,
  CalendarDays,
  User,
  Pencil,
  Trash2,
  Printer,
} from "lucide-react";
import {
  useDiaryAccount,
  useDiaryTransactions,
  useDiaryMutations,
  useEditDiaryTransaction,
  useDeleteDiaryTransaction,
  useDeleteDiaryAccount,
} from "../hooks/useDiary";
import { useAuthStore } from "@/store/authStore";
import { DiaryActionModal } from "./DiaryActionModal";
import { EditTransactionModal } from "./EditTransactionModal";
import type { DiaryAccount, DiaryTransaction } from "../types";
import { formatDisplayDate } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));

const isNegativeAmount = (value: number | string) => Number(value) < 0;

interface Props {
  account: DiaryAccount;
  onBack: () => void;
}

export function DiaryDetailView({ account, onBack }: Props) {
  const { data: accountDetail } = useDiaryAccount(account.id);
  const { data: transactions = [], isLoading: txLoading } =
    useDiaryTransactions(account.id);
  const {
    deposit,
    withdraw,
    postInterest,
    isDepositing,
    isWithdrawing,
    isPostingInterest,
  } = useDiaryMutations();

  const [modalType, setModalType] = useState<
    "deposit" | "withdraw" | "interest" | null
  >(null);
  const [editingTx, setEditingTx] = useState<DiaryTransaction | null>(null);

  const editTransaction = useEditDiaryTransaction();
  const deleteMutation = useDeleteDiaryTransaction();
  const deleteAccountMutation = useDeleteDiaryAccount();

  const role = useAuthStore((s) => s.role);

  const [txToDelete, setTxToDelete] = useState<DiaryTransaction | null>(null);
  const [accountToDelete, setAccountToDelete] = useState(false);

  const currentAccount = accountDetail ?? account;

  const handleDelete = async () => {
    if (!txToDelete) return;
    try {
      await deleteMutation.mutateAsync({
        accountId: account.id,
        txId: txToDelete.id,
      });
      setTxToDelete(null);
      toast.success(`Transaction deleted successfully`);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error(`Failed to delete transaction`);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccountMutation.mutateAsync(account.id);
      setAccountToDelete(false);
      toast.success(`Diary account deleted successfully`);
      onBack();
    } catch (err) {
      console.error("Delete account failed", err);
      toast.error(`Failed to delete diary account`);
    }
  };

  const handleAction = async (dto: any) => {
    if (modalType === "deposit") {
      await deposit.mutateAsync({ id: account.id, dto });
    } else if (modalType === "withdraw") {
      await withdraw.mutateAsync({ id: account.id, dto });
    } else if (modalType === "interest") {
      await postInterest.mutateAsync({ id: account.id, dto });
    }
    setModalType(null);
  };

  const cycleLabel = currentAccount.cycleStartDate
    ? formatDisplayDate(currentAccount.cycleStartDate)
    : "—";

  return (
    <div className="px-4 py-2 sm:px-6 sm:py-4 flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Button
          variant="ghost"
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold pl-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Accounts
        </Button>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setModalType("interest")}
            className="rounded-xl h-10 px-4 gap-2 font-bold border-primary text-primary hover:bg-primary/5"
          >
            <TrendingUp className="w-4 h-4" /> Post Interest
          </Button>
          <Button
            variant="outline"
            onClick={() => setModalType("withdraw")}
            className="rounded-xl h-10 px-4 gap-2 font-bold border-destructive text-destructive hover:bg-destructive/5"
          >
            <Minus className="w-4 h-4" /> Withdrawal
          </Button>
          <Button
            onClick={() => setModalType("deposit")}
            className="rounded-xl h-10 px-5 gap-2 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> Add Deposit
          </Button>
          <Button
            variant="outline"
            onClick={() => setAccountToDelete(true)}
            className="rounded-xl h-10 px-4 gap-2 font-bold border-destructive text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="w-4 h-4" /> Delete Diary
          </Button>
        </div>
      </div>

      {/* Account Info Card */}
      <Card className="overflow-hidden border-muted-foreground/15 shadow-sm">
        <CardContent className="px-4 sm:px-6 py-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shadow-sm">
                <User className="w-8 h-8" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Account ID: {currentAccount.accountCode || "N/A"}
                </p>
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  {currentAccount.customer?.name || "Unknown Customer"}
                </h2>
                <div className="flex items-center gap-4 mt-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                    <Phone className="w-3.5 h-3.5" />
                    {currentAccount.customer?.phone || "No phone"}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground border-l border-muted-foreground/20 pl-4">
                    <CalendarDays className="w-3.5 h-3.5" />
                    Cycle Start:{" "}
                    <span className="text-foreground/80">{cycleLabel}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right w-full md:w-auto pt-5 md:pt-0 border-t md:border-t-0 border-muted-foreground/10">
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                Current Balance
              </p>
              <p
                className={cn(
                  "text-4xl font-black tabular-nums tracking-tight",
                  isNegativeAmount(currentAccount.balance)
                    ? "text-destructive"
                    : "text-emerald-600",
                )}
              >
                {fmt(currentAccount.balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="border-muted-foreground/15 shadow-sm overflow-hidden">
        <CardHeader className="px-6 py-4 border-b border-muted-foreground/10 bg-muted/20 flex flex-row items-center gap-2 space-y-0">
          <ReceiptText className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-black text-foreground uppercase tracking-widest">
            Transaction History
          </h3>
        </CardHeader>

        {txLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Spinner className="size-8 text-primary" />
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Fetching transactions...
            </p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ReceiptText className="w-8 h-8 text-muted-foreground/30" />
            </div>
            <p className="text-sm font-bold text-muted-foreground">
              No transaction history found
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              New deposits or withdrawals will appear here.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 h-11 text-[10px] font-black uppercase tracking-widest">
                  Date
                </TableHead>
                <TableHead className="px-6 h-11 text-[10px] font-black uppercase tracking-widest">
                  Type
                </TableHead>
                <TableHead className="px-6 h-11 text-[10px] font-black uppercase tracking-widest">
                  Notes
                </TableHead>
                <TableHead className="px-6 h-11 text-[10px] font-black uppercase tracking-widest text-right">
                  Credit (+)
                </TableHead>
                <TableHead className="px-6 h-11 text-[10px] font-black uppercase tracking-widest text-right">
                  Debit (-)
                </TableHead>
                <TableHead className="px-6 h-11 text-[10px] font-black uppercase tracking-widest text-right">
                  Balance
                </TableHead>
                {role === "admin" && (
                  <TableHead className="px-6 h-11 text-[10px] font-black uppercase tracking-widest text-center">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const type = tx.type.toLowerCase();
                const isCredit = type === "deposit" || type === "interest";
                const isDebit = type === "withdrawal" || type === "charge";

                return (
                  <TableRow key={tx.id} className="group transition-colors">
                    <TableCell className="px-6 py-4 text-xs font-bold text-muted-foreground">
                      {tx.transactionDate}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 h-6",
                          isCredit &&
                            "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                          isDebit &&
                            "bg-destructive/10 text-destructive border-destructive/20",
                          !isCredit &&
                            !isDebit &&
                            "bg-primary/10 text-primary border-primary/20",
                        )}
                      >
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs font-medium text-muted-foreground/80 italic">
                      {tx.notes || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-bold text-emerald-600 tabular-nums">
                      {isCredit ? (
                        fmt(tx.amount)
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-bold text-destructive tabular-nums">
                      {isDebit ? (
                        fmt(tx.amount)
                      ) : (
                        <span className="text-muted-foreground/30">—</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right text-sm font-black text-foreground tabular-nums">
                      <span
                        className={cn(
                          isNegativeAmount(tx.balanceAfter)
                            ? "text-destructive"
                            : "text-foreground",
                        )}
                      >
                        {fmt(tx.balanceAfter)}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {role === "admin" ? (
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                            title="Print Receipt"
                            onClick={() =>
                              window.open(
                                `/receipt/${tx.id}?source=diary`,
                                "_blank",
                              )
                            }
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                            title="Edit transaction"
                            onClick={() => setEditingTx(tx)}
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 border-destructive text-destructive hover:bg-destructive hover:text-white transition-colors"
                            title="Delete transaction"
                            onClick={() => setTxToDelete(tx)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {modalType && (
        <DiaryActionModal
          open={!!modalType}
          type={modalType}
          currentBalance={currentAccount.balance}
          onClose={() => setModalType(null)}
          onSave={handleAction}
          isPending={isDepositing || isWithdrawing || isPostingInterest}
        />
      )}

      {editingTx && (
        <EditTransactionModal
          open={!!editingTx}
          transaction={editingTx}
          isPending={editTransaction.isPending}
          onClose={() => setEditingTx(null)}
          onSave={async (dto) => {
            await editTransaction.mutateAsync({
              accountId: account.id,
              txId: editingTx.id,
              dto,
            });
            setEditingTx(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!txToDelete}
        onOpenChange={(open) => !open && setTxToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">
              Delete Transaction?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to delete this {txToDelete?.type} of{" "}
              <span className="font-bold text-foreground">
                {txToDelete ? fmt(txToDelete.amount) : ""}
              </span>
              ? This action cannot be undone and will recalculate all subsequent
              balances.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-4">
            <AlertDialogCancel className="rounded-2xl w font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Delete Account Confirmation */}
      <AlertDialog
        open={accountToDelete}
        onOpenChange={(open) => !open && setAccountToDelete(false)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">
              Delete Diary Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm font-medium text-muted-foreground">
              Are you sure you want to permanently delete the diary account for
              <span className="font-bold">
                {" "}
                {currentAccount.customer?.name || currentAccount.id}
              </span>
              ? This will remove all transactions and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-4">
            <AlertDialogCancel className="rounded-2xl w font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteAccountMutation.isPending}
            >
              {deleteAccountMutation.isPending
                ? "Deleting..."
                : "Permanently Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
