// src/feature/admin/diary/components/DiaryActionModal.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { IndianRupee, Calendar, StickyNote, TrendingUp } from "lucide-react";
import {
  diaryActionSchema,
  type DiaryActionFormData,
} from "../schemas/diary.schema";
import type { DiaryActionDto } from "../types";

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
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { cn, localToday } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dto: DiaryActionDto) => void;
  isPending?: boolean;
  type: "deposit" | "withdraw" | "interest";
  currentBalance: number;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

const TYPE_CONFIG = {
  deposit: {
    label: "Deposit",
    iconBg: "bg-emerald-500/10 text-emerald-600",
    btnClass: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20",
    icon: IndianRupee,
    description: "Add savings to this account",
  },
  withdraw: {
    label: "Withdrawal",
    iconBg: "bg-destructive/10 text-destructive",
    btnClass: "bg-destructive hover:bg-destructive/90 shadow-destructive/20",
    icon: IndianRupee,
    description: "Remove funds from this account",
  },
  interest: {
    label: "Post Interest",
    iconBg: "bg-primary/10 text-primary",
    btnClass: "bg-primary hover:bg-primary/90 shadow-primary/20",
    icon: TrendingUp,
    description: "Calculate and add interest amount",
  },
};

export function DiaryActionModal({
  open,
  onClose,
  onSave,
  isPending,
  type,
  currentBalance,
}: Props) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DiaryActionFormData>({
    resolver: zodResolver(diaryActionSchema),
    defaultValues: {
      transactionDate: localToday(),
      amount: 0,
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: DiaryActionFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-visible rounded-3xl">
        <DialogHeader className="p-6 bg-muted/20 border-b border-muted-foreground/10">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm",
                config.iconBg,
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-lg font-black tracking-tight">
                Diary {config.label}
              </DialogTitle>
              <DialogDescription className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                <span
                  className={cn(
                    currentBalance < 0
                      ? "text-destructive"
                      : "text-muted-foreground",
                  )}
                >
                  Current Balance: {fmt(currentBalance)}
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
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
              buttonClassName="h-12 rounded-xl bg-muted/40 border-muted-foreground/20 focus:ring-primary/20 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <StickyNote className="w-3.5 h-3.5" /> Notes (Optional)
            </Label>
            <Input
              {...register("notes")}
              placeholder={config.description}
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
              className={cn(
                "flex-1 rounded-xl h-12 font-black shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]",
                config.btnClass,
              )}
            >
              {isPending ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  Processing...
                </>
              ) : (
                `Confirm ${config.label}`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
