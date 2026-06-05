// src/feature/admin/loans/components/RecordPaymentModal.tsx
import { useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  IndianRupee,
  CreditCard,
  Calendar,
  StickyNote,
  BookOpen,
} from "lucide-react";
import { useDiaryAccounts } from "@/feature/admin/diary/hooks/useDiary";
import {
  transactionSchema,
  type TransactionFormData,
} from "../schemas/loan.schema";
import type { CreateTransactionDto } from "../types";
import { localToday } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/components/ui/date-picker-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dto: CreateTransactionDto) => void;
  isPending?: boolean;
  remainingBalance: number;
  emiAmount: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function RecordPaymentModal({
  open,
  onClose,
  onSave,
  isPending,
  remainingBalance,
  emiAmount,
}: Props) {
  const [quickFill, setQuickFill] = useState<number | null>(null);
  const { data: diaryAccounts = [] } = useDiaryAccounts();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "emi",
      paymentDate: localToday(),
      paymentMode: "cash",
      amount: emiAmount,
    },
  });

  const handleClose = () => {
    reset();
    setQuickFill(null);
    onClose();
  };

  const onSubmit: SubmitHandler<TransactionFormData> = (data) => {
    // Only send diary fields if both are present and valid
    const diaryAmount =
      data.diaryAmount && !isNaN(data.diaryAmount)
        ? data.diaryAmount
        : undefined;
    const diaryAccountId =
      data.diaryAccountId === "none" || !data.diaryAccountId
        ? undefined
        : data.diaryAccountId;

    onSave({
      type: data.type,
      amount: data.amount,
      paymentMode: data.paymentMode,
      paymentDate: data.paymentDate,
      notes: data.notes,
      diaryAmount,
      diaryAccountId,
    });
  };

  const applyQuickFill = (amount: number) => {
    setQuickFill(amount);
    setValue("amount", amount, { shouldValidate: true });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-3xl bg-white rounded-2xl shadow-ambient-xl p-0 overflow-hidden border-none animate-slide-up">
        {/* Header */}
        <DialogHeader className="px-5 py-3 border-b border-[#c1c6d5]/20 bg-[#f8f9ff] flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#005eb0]/10 flex items-center justify-center text-[#005eb0]">
              <IndianRupee className="w-4 h-4" />
            </div>
            <div className="text-left">
              <DialogTitle
                className="text-sm font-extrabold text-[#121c28]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Record Payment
              </DialogTitle>
              <p className="text-[11px] text-[#717784] font-bold">
                Remaining Balance: {fmt(remainingBalance)}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form — tighter spacing */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-2 sm:px-5 space-y-4"
        >
          {/* Quick Fill */}
          <div className="bg-[#f0f4ff]/50 px-4 py-3 rounded-xl border border-[#005eb0]/10">
            <p className="text-[10px] font-black text-[#005eb0] uppercase tracking-wider mb-2">
              Quick Payment Options
            </p>
            <div className="flex flex-wrap gap-2">
              {[emiAmount, Math.round(emiAmount * 2), remainingBalance]
                .filter((v, i, a) => a.indexOf(v) === i && v > 0)
                .map((amt) => (
                  <Button
                    key={amt}
                    type="button"
                    variant={quickFill === amt ? "default" : "outline"}
                    onClick={() => applyQuickFill(amt)}
                    className={`h-8 px-3 text-xs font-bold transition-all rounded-lg ${
                      quickFill === amt
                        ? "bg-[#005eb0] hover:bg-[#004d90] border-[#005eb0]"
                        : "bg-white text-[#43474f] border-[#c1c6d5]/30 hover:border-[#005eb0] hover:bg-[#f0f4ff]"
                    }`}
                  >
                    {fmt(amt)}
                    {amt === remainingBalance
                      ? " (Full)"
                      : amt === emiAmount
                        ? " (EMI)"
                        : " (2x EMI)"}
                  </Button>
                ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-3">
              {/* Type */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#43474f] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#005eb0]" /> Payment
                  Type
                </Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9 w-full bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus:ring-[#005eb0]/20">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-xl border-[#c3c6d1]/20"
                        position="popper"
                        align="start"
                      >
                        <SelectItem value="emi">EMI Payment</SelectItem>
                        <SelectItem value="full_payment">
                          Full Settlement
                        </SelectItem>
                        <SelectItem value="penalty">Penalty</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Amount */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#43474f] flex items-center gap-1.5">
                  <IndianRupee className="w-3.5 h-3.5 text-[#005eb0]" /> Amount
                  (₹)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  className={`h-9 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-[#005eb0]/20 ${
                    errors.amount ? "border-[#ba1a1a]" : ""
                  }`}
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-[10px] text-[#ba1a1a] font-medium">
                    {errors.amount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-3">
              {/* Payment Mode */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#43474f] flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-[#005eb0]" /> Payment
                  Mode
                </Label>
                <Controller
                  name="paymentMode"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9 w-full bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus:ring-[#005eb0]/20">
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-xl border-[#c3c6d1]/20"
                        position="popper"
                        align="start"
                      >
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Date */}
              <div className="space-y-1">
                <Label className="text-xs font-bold text-[#43474f] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#005eb0]" /> Payment
                  Date
                </Label>
                <DatePickerField
                  // eslint-disable-next-line react-hooks/incompatible-library
                  value={watch("paymentDate")}
                  onChange={(value) => setValue("paymentDate", value ?? "")}
                  buttonClassName="h-9 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-[#005eb0]/20"
                />
              </div>
            </div>

            {/* Notes — Full Width */}
            <div className="md:col-span-2 space-y-1">
              <Label className="text-xs font-bold text-[#43474f] flex items-center gap-1.5">
                <StickyNote className="w-3.5 h-3.5 text-[#005eb0]" /> Notes
                (Optional)
              </Label>
              <Input
                {...register("notes")}
                placeholder="e.g. Received by Cheque No. 123456"
                className="h-9 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-[#005eb0]/20"
              />
            </div>

            {/* Diary — Full Width, compact */}
            <div className="md:col-span-2 bg-[#f8f9ff] rounded-xl p-4 border border-[#005eb0]/10 space-y-3">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-lg bg-white border border-[#005eb0]/20 shadow-sm">
                  <BookOpen className="w-3.5 h-3.5 text-[#005eb0]" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#121c28] uppercase tracking-wider">
                    Savings Diary Sync
                  </h4>
                  <p className="text-[10px] text-[#717784] font-medium">
                    Optionally deposit a portion into user's savings account
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-[#43474f]">
                    Amount to Diary
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register("diaryAmount", { valueAsNumber: true })}
                    placeholder="0.00"
                    className="h-9 bg-white border-[#c3c6d1]/30 rounded-lg focus-visible:ring-[#005eb0]/20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-[#43474f]">
                    Select Destination Diary
                  </Label>
                  <Controller
                    name="diaryAccountId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="h-9 w-full bg-white  border-input  rounded-lg focus:ring-[#005eb0]/20">
                          <SelectValue placeholder="No Diary" />
                        </SelectTrigger>
                        <SelectContent
                          className="rounded-lg  border-[#c3c6d1]/20"
                          position="popper"
                          align="start"
                        >
                          <SelectItem value="none">
                            No Diary (Don't Sync)
                          </SelectItem>
                          {diaryAccounts.map((acc) => (
                            <SelectItem key={acc.id} value={acc.id}>
                              {acc.customer?.name ?? "Customer"} —{" "}
                              {fmt(acc.balance)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
        {/* Footer — compact */}
        <DialogFooter className="px-4 py-3 border-t border-[#c1c6d5]/20 bg-[#f8f9ff] sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-9 px-4 rounded-xl border-[#c3c6d1] text-[#43474f] font-bold hover:bg-white w-1/2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
            className="h-9 px-4 gradient-primary rounded-xl text-white font-bold hover:opacity-90 shadow-md w-1/2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Recording...
              </>
            ) : (
              "Confirm Payment"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
