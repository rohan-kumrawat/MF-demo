// src/feature/admin/diary/components/EditTransactionModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IndianRupee, Calendar, StickyNote, Pencil } from "lucide-react";
import {
  editDiaryTransactionSchema,
  type EditDiaryTransactionFormData,
} from "../schemas/diary.schema";
import type { DiaryTransaction } from "../types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dto: EditDiaryTransactionFormData) => void;
  isPending?: boolean;
  transaction: DiaryTransaction;
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
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditDiaryTransactionFormData>({
    resolver: zodResolver(editDiaryTransactionSchema),
    defaultValues: {
      amount: transaction.amount,
      transactionDate: transaction.transactionDate.slice(0, 10),
      notes: transaction.notes ?? "",
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        amount: transaction.amount,
        transactionDate: transaction.transactionDate.slice(0, 10),
        notes: transaction.notes ?? "",
      });
    }
  }, [open, transaction, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-visible rounded-3xl">
        <DialogHeader className="p-6 bg-muted/20 border-b border-muted-foreground/10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm bg-primary/10 text-primary">
              <Pencil className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-lg font-black tracking-tight">
                Edit Transaction
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                Type: {transaction.type}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSave)} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5" /> Amount (₹)
            </Label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", { valueAsNumber: true })}
              className={cn(
                "h-12 rounded-xl bg-muted/40 border-muted-foreground/20 focus:ring-primary/20 font-bold text-lg",
                errors.amount && "border-destructive focus:ring-destructive/20",
              )}
            />
            {errors.amount && (
              <p className="text-xs font-bold text-destructive px-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5" /> Transaction Date
            </Label>
            <DatePickerField
              // eslint-disable-next-line react-hooks/incompatible-library
              value={watch("transactionDate")}
              onChange={(value) => setValue("transactionDate", value ?? "")}
              buttonClassName={cn(
                "h-12 rounded-xl bg-muted/40 border-muted-foreground/20 focus:ring-primary/20 font-medium",
                errors.transactionDate &&
                  "border-destructive focus:ring-destructive/20",
              )}
            />
            {errors.transactionDate && (
              <p className="text-xs font-bold text-destructive px-1">
                {errors.transactionDate.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <StickyNote className="w-3.5 h-3.5" /> Notes (Optional)
            </Label>
            <Input
              {...register("notes")}
              placeholder="Add a correction note..."
              className="h-12 rounded-xl bg-muted/40 border-muted-foreground/20 focus:ring-primary/20"
            />
          </div>

          <DialogFooter className="pt-4 gap-3 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
              className="flex-1 rounded-xl h-12 font-bold text-muted-foreground"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-xl h-12 font-black shadow-lg bg-primary hover:bg-primary/90 shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
