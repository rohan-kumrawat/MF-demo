import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  Calendar,
  CreditCard,
  StickyNote,
  BookOpen,
  RefreshCw,
} from "lucide-react";
import { useDiaryAccounts } from "@/feature/admin/diary/hooks/useDiary";
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

const renewBulletSchema = z.object({
  paymentMode: z.enum(["cash", "upi", "bank"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
  diaryAmount: z.number().optional().catch(undefined),
  diaryAccountId: z.string().optional().or(z.literal("none")),
});

type RenewBulletFormData = z.infer<typeof renewBulletSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dto: {
    paymentDate: string;
    paymentMode: string;
    notes?: string;
    diaryAmount?: number;
    diaryAccountId?: string;
  }) => void;
  isPending?: boolean;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

export function RenewBulletLoanModal({
  open,
  onClose,
  onSave,
  isPending,
}: Props) {
  const { data: diaryAccounts = [] } = useDiaryAccounts();

  const { register, handleSubmit, reset, control, watch, setValue } =
    useForm<RenewBulletFormData>({
      resolver: zodResolver(renewBulletSchema),
      defaultValues: {
        paymentDate: localToday(),
        paymentMode: "cash",
      },
    });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit: SubmitHandler<RenewBulletFormData> = (data) => {
    const diaryAmount =
      data.diaryAmount && !isNaN(data.diaryAmount)
        ? data.diaryAmount
        : undefined;
    const diaryAccountId =
      data.diaryAccountId === "none" || !data.diaryAccountId
        ? undefined
        : data.diaryAccountId;

    onSave({
      paymentMode: data.paymentMode,
      paymentDate: data.paymentDate,
      notes: data.notes,
      diaryAmount,
      diaryAccountId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent
        aria-describedby={undefined}
        className="sm:max-w-2xl bg-white rounded-2xl shadow-ambient-xl p-0 overflow-hidden border-none animate-slide-up"
      >
        {/* Header */}
        <DialogHeader className="px-5 py-3 border-b border-[#c1c6d5]/20 bg-[#f8f9ff] flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="text-left">
              <DialogTitle
                className="text-sm font-extrabold text-[#121c28]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Renew Bullet Loan
              </DialogTitle>
              <p className="text-[11px] text-[#717784] font-bold">
                Pay 1 month interest to extend deadline
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Mode */}
            <div className="space-y-1">
              <Label className="text-xs font-bold text-[#43474f] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-primary" /> Payment Mode
              </Label>
              <Controller
                name="paymentMode"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="h-9 w-full bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus:ring-primary/20">
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
                <Calendar className="w-3.5 h-3.5 text-primary" /> Payment Date
              </Label>
              <DatePickerField
                value={watch("paymentDate")}
                onChange={(value) => setValue("paymentDate", value ?? "")}
                buttonClassName="h-9 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-[#43474f] flex items-center gap-1.5">
              <StickyNote className="w-3.5 h-3.5 text-primary" /> Notes
              (Optional)
            </Label>
            <Input
              {...register("notes")}
              placeholder="e.g. Paid 1 month interest"
              className="h-9 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-primary/20"
            />
          </div>

          {/* Diary */}
          <div className="bg-[#f8f9ff] rounded-xl p-4 border border-primary/10 space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-white border border-primary/20 shadow-sm">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#121c28] uppercase tracking-wider">
                  Savings Diary Sync
                </h4>
                <p className="text-[10px] text-[#717784] font-medium">
                  Optionally deduct payment from savings account
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-[#43474f]">
                  Amount from Diary
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("diaryAmount", { valueAsNumber: true })}
                  placeholder="0.00"
                  className="h-9 bg-white border-[#c3c6d1]/30 rounded-lg focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-bold text-[#43474f]">
                  Select Diary Account
                </Label>
                <Controller
                  name="diaryAccountId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-9 w-full bg-white border-input rounded-lg focus:ring-primary/20">
                        <SelectValue placeholder="No Diary" />
                      </SelectTrigger>
                      <SelectContent
                        className="rounded-lg border-[#c3c6d1]/20"
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
        </form>

        {/* Footer */}
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
                Processing...
              </>
            ) : (
              "Renew Loan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
