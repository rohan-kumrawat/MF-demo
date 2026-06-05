// src/feature/admin/loans/components/DeleteTransactionModal.tsx
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n));

interface TransactionMeta {
  id: string;
  receiptNo: string;
  amount: string | number;
  type: string;
  paymentDate: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
  transaction: TransactionMeta | null;
}

export function DeleteTransactionModal({
  open,
  onClose,
  onConfirm,
  isPending,
  transaction,
}: Props) {
  if (!open || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#121c28]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-ambient-xl w-full max-w-md overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c1c6d5]/20 bg-[#f8f9ff] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="text-base font-extrabold text-[#121c28]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Delete Transaction
              </h3>
              <p className="text-[11px] text-[#717784] font-bold font-mono">
                {transaction.receiptNo}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f0f2f5] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#43474f]" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-sm text-[#43474f] leading-relaxed">
              This will permanently delete the payment of{" "}
              <span className="font-bold">{fmt(transaction.amount)}</span> (
              <span className="capitalize">
                {transaction.type.replace("_", " ")}
              </span>{" "}
              on {transaction.paymentDate}). Loan balances will be recalculated
              automatically. This action cannot be undone.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-[#c3c6d1] rounded-xl text-sm font-bold text-[#43474f] hover:bg-[#f8f9ff] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isPending}
              className="flex-1 py-3 bg-destructive hover:bg-destructive/90 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              {isPending ? "Deleting..." : "Delete Transaction"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
