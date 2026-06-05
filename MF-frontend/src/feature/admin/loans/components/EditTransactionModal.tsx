import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, Loader2 } from "lucide-react";
import type { Transaction, EditTransactionDto } from "../types";
import {
  editTransactionSchema,
  type EditTransactionFormData,
} from "../schemas/loan.schema";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  onSave: (dto: EditTransactionDto) => void;
  isPending?: boolean;
  transaction: Transaction | null;
}

export function EditTransactionModal({
  open,
  onClose,
  onSave,
  isPending,
  transaction,
}: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditTransactionFormData>({
    resolver: zodResolver(editTransactionSchema),
    defaultValues: {
      amount: transaction ? Number(transaction.amount) : 0,
      paymentDate: transaction?.paymentDate ?? "",
      paymentMode: transaction?.paymentMode ?? "cash",
      notes: "",
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: EditTransactionFormData) => {
    const dto: EditTransactionDto = {};

    if (
      data.amount !== undefined &&
      Number(data.amount) !== Number(transaction?.amount)
    ) {
      dto.amount = data.amount;
    }
    if (data.paymentDate && data.paymentDate !== transaction?.paymentDate) {
      dto.paymentDate = data.paymentDate;
    }
    if (data.paymentMode && data.paymentMode !== transaction?.paymentMode) {
      dto.paymentMode = data.paymentMode;
    }
    if (data.notes?.trim()) {
      dto.notes = data.notes.trim();
    }

    onSave(dto);
  };

  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-ambient-xl p-0 overflow-hidden border-none animate-slide-up">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-[#c1c6d5]/20 bg-[#f8f9ff] flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#005eb0]/10 flex items-center justify-center text-[#005eb0]">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle
                className="text-base font-extrabold text-[#121c28]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Edit Transaction
              </DialogTitle>
              <p className="text-[11px] text-[#717784] font-bold font-mono">
                {transaction.receiptNo}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-[#43474f]">
              Amount (₹)
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              className={`h-10 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-[#005eb0]/20 ${
                errors.amount ? "border-[#ba1a1a]" : ""
              }`}
            />
            {errors.amount && (
              <p className="text-[10px] text-[#ba1a1a] font-medium">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-[#43474f]">
              Payment Date
            </Label>
            <DatePickerField
              value={watch("paymentDate")}
              onChange={(value) => setValue("paymentDate", value ?? "")}
              buttonClassName="h-10 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-[#005eb0]/20"
            />
            {errors.paymentDate && (
              <p className="text-[10px] text-[#ba1a1a] font-medium">
                {errors.paymentDate.message}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-[#43474f]">
              Payment Mode
            </Label>
            <Controller
              name="paymentMode"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="h-10 w-full bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus:ring-[#005eb0]/20">
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-[#c3c6d1]/20">
                    <SelectItem value="cash">CASH</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">BANK TRANSFER</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-[#43474f]">
              Notes (Optional)
            </Label>
            <Textarea
              {...register("notes")}
              rows={2}
              placeholder="e.g. Corrected payment amount"
              className="bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-[#005eb0]/20 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1 h-11 border-[#c3c6d1] rounded-xl text-sm font-bold text-[#43474f] hover:bg-[#f8f9ff]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 h-11 bg-[#005eb0] hover:bg-[#004a8c] text-white rounded-xl text-sm font-bold shadow-md"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
