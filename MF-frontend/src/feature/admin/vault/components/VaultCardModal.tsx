import { useState } from "react";
import { X, CreditCard } from "lucide-react";
import type { VaultCard } from "../types";
import { useCreateVaultCard, useUpdateVaultCard } from "../hooks/useVault";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editData?: VaultCard | null;
}

const emptyCardForm = {
  bankName: "",
  cardNumber: "",
  cvv: "",
  expDate: "",
  billGenerateDate: "",
  dueDate: "",
  billAmount: "",
  remarks: "",
};

export function VaultCardModal({ isOpen, onClose, editData }: Props) {
  const [formData, setFormData] = useState(emptyCardForm);

  const createCard = useCreateVaultCard();
  const updateCard = useUpdateVaultCard();

  // Track previous key in state to reset form when editData/isOpen changes
  const currentKey = `${editData?.id ?? "new"}-${isOpen}`;
  const [prevKey, setPrevKey] = useState(currentKey);

  if (currentKey !== prevKey) {
    setPrevKey(currentKey);
    if (editData) {
      setFormData({
        bankName: editData.bankName || "",
        cardNumber: editData.cardNumber || "",
        cvv: editData.cvv || "",
        expDate: editData.expDate || "",
        billGenerateDate: editData.billGenerateDate || "",
        dueDate: editData.dueDate || "",
        billAmount: editData.billAmount ? editData.billAmount.toString() : "",
        remarks: editData.remarks || "",
      });
    } else {
      setFormData(emptyCardForm);
    }
  }

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      billAmount: formData.billAmount ? Number(formData.billAmount) : null,
    };

    try {
      if (editData) {
        await updateCard.mutateAsync({ id: editData.id, data: data as any });
      } else {
        await createCard.mutateAsync(data as any);
      }
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  const isLoading = createCard.isPending || updateCard.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {editData ? "Edit Card & Bill" : "Add Card & Bill"}
              </h2>
              <p className="text-sm text-gray-500">
                {editData
                  ? "Update vault entry"
                  : "Securely save new credit card details"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="card-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. HDFC Bank"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Card Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.cardNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, cardNumber: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="XXXX XXXX XXXX XXXX"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  CVV
                </label>
                <input
                  type="text"
                  value={formData.cvv}
                  onChange={(e) =>
                    setFormData({ ...formData, cvv: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="123"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Exp Date
                </label>
                <input
                  type="text"
                  value={formData.expDate}
                  onChange={(e) =>
                    setFormData({ ...formData, expDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="MM/YY"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Bill Generate Date
                </label>
                <input
                  type="text"
                  value={formData.billGenerateDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      billGenerateDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. 5th of every month"
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Due Date
                </label>
                <input
                  type="text"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="e.g. 25th of every month"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Bill Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.billAmount}
                  onChange={(e) =>
                    setFormData({ ...formData, billAmount: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  placeholder="0.00"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) =>
                    setFormData({ ...formData, remarks: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none h-24"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>
          </form>
        </div>

        <div className="p-6 border-t border-gray-100 shrink-0 flex justify-end gap-3 bg-gray-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            form="card-form"
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl font-semibold bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
