import { useEffect } from "react";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  collectEmiSchema,
  type CollectEmiFormData,
} from "../schemas/collection.schema";

const formatRupee = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    amount,
  );

export function CollectionModal({
  item,
  onClose,
  onSubmit,
}: {
  item: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CollectEmiFormData>({
    resolver: zodResolver(collectEmiSchema),
    defaultValues: {
      amount: 0,
      mode: "Cash",
      useDiary: false,
    },
  });

  const shouldUseDiary = watch("useDiary");

  useEffect(() => {
    if (item) {
      setValue("amount", item.emi || 0);
    }
  }, [item, setValue]);

  if (!item) return null;

  const onSubmitForm = (data: CollectEmiFormData) => {
    onSubmit({ ...data, item });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div
        className="absolute inset-0 bg-[#121c28]/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-ambient-xl w-full max-w-sm mx-4 animate-slide-up overflow-hidden">
        <div className="gradient-primary px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <h3
              className="text-base font-bold"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Collect EMI
            </h3>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm opacity-80 mt-0.5">
            {item.customerName} · {item.accountNo}
          </p>
        </div>
        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-4">
          <div className="flex justify-between items-center bg-[#f8f9ff] rounded-xl p-3 border border-[#c3c6d1]/20">
            <div>
              <p className="text-xs text-[#43474f]">EMI Due</p>
              <p className="text-lg font-bold text-[#001e40]">
                {formatRupee(item.emi)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#43474f]">Diary Balance</p>
              <p className="text-sm font-bold text-[#006c49]">
                {formatRupee(item.diaryBalance || 0)}
              </p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#43474f] mb-1.5 block">
              Amount Collected (₹)
            </label>
            <input
              type="number"
              {...register("amount", { valueAsNumber: true })}
              className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c3c6d1]/30 rounded-xl text-sm focus:outline-none focus:border-[#3a5f94] transition-all"
            />
            {errors.amount && (
              <p className="text-xs text-red-500 mt-1">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-[#43474f] mb-1.5 block">
              Payment Mode
            </label>
            <select
              {...register("mode")}
              className="w-full px-4 py-2.5 bg-[#f8f9ff] border border-[#c3c6d1]/30 rounded-xl text-sm focus:outline-none transition-all"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${shouldUseDiary ? "border-[#001e40] bg-[#001e40]" : "border-[#c3c6d1]"}`}
              onClick={() => setValue("useDiary", !shouldUseDiary)}
            >
              {shouldUseDiary && (
                <span className="text-white text-[10px]">✓</span>
              )}
            </div>
            <span className="text-xs text-[#43474f]">
              Use diary balance for shortfall
            </span>
          </label>

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-[#c3c6d1] rounded-xl text-sm font-semibold text-[#43474f] hover:bg-[#f8f9ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 gradient-primary rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            >
              Submit & Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
