// src/feature/agent/components/CollectModal.tsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Label } from "@/components/ui/label";
import {
  type AgentCustomer,
  type ApiLoan,
  type CreateTransactionDto,
} from "../types";
import { agentService } from "../services/agentService";
import { Wallet, BookOpen, ChevronRight, Info } from "lucide-react";
import { cn, localToday } from "@/lib/utils";

const formatRupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const today = localToday;

type TxType = "loan" | "diary";

interface Props {
  customer: AgentCustomer | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    customer: AgentCustomer,
    dto: Partial<CreateTransactionDto>,
  ) => Promise<void>;
  /** True while the loan summary API is in-flight */
  isLoadingLoans?: boolean;
}

export const CollectModal = React.memo(function CollectModal({
  customer,
  isOpen,
  onClose,
  onSubmit,
  isLoadingLoans = false,
}: Props) {
  const [txType, setTxType] = useState<TxType>("loan");
  const [selectedLoanId, setSelectedLoanId] = useState<string>("");
  const [selectedDiaryId, setSelectedDiaryId] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"Cash" | "UPI" | "Cheque">("Cash");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: diaryAccounts = [], isLoading: isLoadingDiaries } = useQuery({
    queryKey: ["customerDiaryAccounts", customer?.id],
    queryFn: () => agentService.getCustomerDiaryAccounts(customer!.id),
    enabled: isOpen && !!customer?.id,
    staleTime: 30_000,
  });

  const activeDiaries = diaryAccounts.filter((d) => d.isActive);
  const hasDiary = activeDiaries.length > 0;
  const selectedDiary = activeDiaries.find((d) => d.id === selectedDiaryId);

  // Reset state when modal opens/closes or customer changes
  useEffect(() => {
    if (!isOpen || !customer) return;
    if (customer.loans.length > 0) {
      setTxType("loan");
    } else if (hasDiary) {
      setTxType("diary");
    }
    setSelectedLoanId(customer.loans[0]?.id ?? "");
    setAmount("");
    setNotes("");
    setMode("Cash");
  }, [isOpen, customer]);

  // Initialize selected diary when accounts load
  useEffect(() => {
    if (activeDiaries.length > 0 && !selectedDiaryId) {
      setSelectedDiaryId(activeDiaries[0].id);
    }
  }, [activeDiaries]);

  // Reset diary selection when customer changes
  useEffect(() => {
    setSelectedDiaryId("");
  }, [customer?.id]);

  if (!customer) return null;

  const selectedLoan: ApiLoan | undefined = customer.loans.find(
    (l) => l.id === selectedLoanId,
  );
  const hasLoans = customer.loans.length > 0;

  if (isLoadingLoans || isLoadingDiaries) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="rounded-2xl max-w-[95%] sm:max-w-[420px] p-0 overflow-hidden border-border/60">
          <DialogHeader className="px-6 pt-6 pb-4 bg-primary/5 border-b border-border/40">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Wallet className="text-primary" size={18} />
              Collect Payment
            </DialogTitle>
            <DialogDescription className="text-xs font-semibold">
              {customer.name} · {customer.phone}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    setIsSubmitting(true);
    try {
      if (txType === "diary") {
        const diaryCustomer: AgentCustomer = {
          ...customer,
          diaryAccountId: selectedDiaryId,
        };
        await onSubmit(diaryCustomer, {
          amount: 0,
          diaryAmount: numAmount,
          paymentMode: mode.toLowerCase() as "cash" | "upi" | "cheque",
          notes: notes || undefined,
        });
      } else {
        // Loan payment — override loanId on customer with selected one
        const loanCustomer: AgentCustomer = {
          ...customer,
          loanId: selectedLoanId,
        };
        await onSubmit(loanCustomer, {
          amount: numAmount,
          paymentMode: mode.toLowerCase() as "cash" | "upi" | "cheque",
          paymentDate: today(),
          notes: notes || undefined,
        });
      }
      onClose();
    } catch (error: any) {
      console.error("Collection failed:", error);
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedAmount =
    txType === "loan" && selectedLoan
      ? (selectedLoan.emiAmount ??
        selectedLoan.weeklyInstallment ??
        selectedLoan.dailyInstallment ??
        0)
      : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-2xl max-w-[95%] sm:max-w-[420px] p-0 overflow-hidden gap-0 border-border/60">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 bg-primary/5 border-b border-border/40">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Wallet className="text-primary" size={18} />
            Collect Payment
          </DialogTitle>
          <DialogDescription className="text-xs font-semibold">
            {customer.name} · {customer.phone}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Step 1: Transaction Type */}
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Payment Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!hasLoans}
                onClick={() => setTxType("loan")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-sm font-bold",
                  txType === "loan"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/40 text-muted-foreground hover:border-primary/30",
                  !hasLoans && "opacity-40 cursor-not-allowed",
                )}
              >
                <ChevronRight size={18} className="rotate-90" />
                Loan Payment
                {!hasLoans && (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    (No active loan)
                  </span>
                )}
              </button>
              <button
                type="button"
                disabled={!hasDiary}
                onClick={() => setTxType("diary")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all text-sm font-bold",
                  txType === "diary"
                    ? "border-green-500 bg-green-500/10 text-green-600"
                    : "border-border/40 text-muted-foreground hover:border-green-400/30",
                  !hasDiary && "opacity-40 cursor-not-allowed",
                )}
              >
                <BookOpen size={18} />
                Savings Diary
                {!hasDiary && (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    (No diary)
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Step 2: Loan Selector (only when loan type & multiple loans) */}
          {txType === "loan" && customer.loans.length > 1 && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Select Loan Account
              </Label>
              <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                <SelectTrigger className="rounded-2xl h-12 text-sm border-border/60">
                  <SelectValue placeholder="Select loan..." />
                </SelectTrigger>
                <SelectContent
                  className="rounded-2xl"
                  position="popper"
                  align="start"
                >
                  {customer.loans.map((loan) => (
                    <SelectItem key={loan.id} value={loan.id}>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">
                          {loan.loanAccountNumber}
                        </span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          {loan.loanType.toUpperCase()} · Bal{" "}
                          {formatRupee(loan.remainingBalance)}
                          {loan.overdue > 0 &&
                            ` · ⚠️ Overdue ${formatRupee(loan.overdue)}`}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Loan info chip when single loan */}
          {txType === "loan" && customer.loans.length === 1 && selectedLoan && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl px-4 py-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Account</span>
                <span className="font-black">
                  {selectedLoan.loanAccountNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground font-bold">Balance</span>
                <span className="font-black">
                  {formatRupee(selectedLoan.remainingBalance)}
                </span>
              </div>
              {selectedLoan.overdue > 0 && (
                <div className="flex justify-between text-red-500">
                  <span className="font-bold">Overdue</span>
                  <span className="font-black">
                    {formatRupee(selectedLoan.overdue)}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Diary Account Selector (when multiple active diaries) */}
          {txType === "diary" && activeDiaries.length > 1 && (
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Select Diary Account
              </Label>
              <Select
                value={selectedDiaryId}
                onValueChange={setSelectedDiaryId}
              >
                <SelectTrigger className="rounded-2xl h-12 text-sm border-border/60">
                  <SelectValue placeholder="Select diary..." />
                </SelectTrigger>
                <SelectContent
                  className="rounded-2xl"
                  position="popper"
                  align="start"
                >
                  {activeDiaries.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs">{d.diaryName}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          Balance {formatRupee(parseFloat(d.balance))}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Diary info chip */}
          {txType === "diary" && selectedDiary && (
            <div className="bg-green-50 border border-green-200/60 rounded-2xl px-4 py-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-green-700 font-bold">
                  {selectedDiary.diaryName}
                </span>
                <span className="text-green-700 font-black">
                  {formatRupee(parseFloat(selectedDiary.balance))}
                </span>
              </div>
            </div>
          )}

          {/* Step 3: Amount */}
          <div className="space-y-2">
            <Label
              htmlFor="amount"
              className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
            >
              Amount (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-primary text-lg">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "rounded-2xl h-14 text-xl font-black pl-10 text-center border-2 transition-all focus:ring-4 focus:ring-primary/10",
                  txType === "diary"
                    ? "border-green-200 bg-green-50/30 focus:border-green-500"
                    : "border-primary/10 bg-primary/5 focus:border-primary",
                )}
                autoFocus
              />
            </div>
            {suggestedAmount > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(suggestedAmount))}
                className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline pl-1"
              >
                <Info size={12} />
                Use recommended: {formatRupee(suggestedAmount)}
              </button>
            )}
          </div>

          {/* Payment Mode & Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Mode
              </Label>
              <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                <SelectTrigger className="rounded-2xl h-11 text-sm border-border/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  className="rounded-2xl"
                  align="start"
                  position="popper"
                >
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="notes"
                className="text-[10px] font-black uppercase tracking-widest text-muted-foreground"
              >
                Notes
              </Label>
              <Input
                id="notes"
                placeholder="Remarks..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-2xl h-11 text-sm border-border/60"
              />
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="submit"
              disabled={
                isSubmitting ||
                !amount ||
                parseFloat(amount) <= 0 ||
                (txType === "diary" && !hasDiary) ||
                (txType === "loan" && !hasLoans)
              }
              className={cn(
                "w-full h-14 rounded-2xl font-black text-base shadow-xl transition-all active:scale-[0.98]",
                txType === "diary"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-green-500/20"
                  : "gradient-primary text-white shadow-primary/20",
              )}
            >
              {isSubmitting
                ? "Processing..."
                : `Confirm ${txType === "diary" ? "Deposit" : "Payment"} ${amount ? formatRupee(parseFloat(amount) || 0) : ""}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
});
