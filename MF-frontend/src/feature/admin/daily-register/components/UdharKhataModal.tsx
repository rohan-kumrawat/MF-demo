// src/feature/admin/daily-register/components/UdharKhataModal.tsx
import { useState, useRef, useEffect } from "react";
import { Check, Loader2, X, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { udharKhataService } from "@/feature/admin/udhar-khata/services/udharKhataService";
import type { UdharPerson } from "@/feature/admin/udhar-khata/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// ─── Shared modal for creating an Udhar entry ─────────────────────────────────
interface UdharKhataModalProps {
  open: boolean;
  onClose: () => void;
  /** Pre-fill remark from the row's remark field */
  remark?: string;
  /** ISO date string for the register day */
  entryDate: string;
  /** Optional: override person & amount (used by AddEntryRow) */
  initialPerson?: { id: string; name: string } | null;
  initialAmount?: number;
  /** Called with success — parent can decide what to do after */
  onSuccess?: () => void;
}

export function UdharKhataModal({
  open,
  onClose,
  remark,
  entryDate,
  initialPerson,
  initialAmount,
  onSuccess,
}: UdharKhataModalProps) {
  const [search, setSearch] = useState("");
  const [selectedPerson, setSelectedPerson] = useState<UdharPerson | null>(
    null,
  );
  const [entryType, setEntryType] = useState<"liya" | "diya">("liya");
  const [amount, setAmount] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);

  const { data: persons = [] } = useQuery({
    queryKey: ["udhar-persons"],
    queryFn: udharKhataService.getPersons,
  });

  const filtered = persons.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.phone.includes(search),
  );

  // Reset & seed from props when modal opens
  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSaved(false);
    setEntryType("liya");

    if (initialPerson) {
      const found = persons.find((p) => p.id === initialPerson.id) ?? null;
      setSelectedPerson(found);
    } else {
      setSelectedPerson(null);
    }
    setAmount(initialAmount ? String(initialAmount) : "");

    // Focus search after open animation
    setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Move focus to amount when person is selected
  useEffect(() => {
    if (selectedPerson) {
      setTimeout(() => amountRef.current?.focus(), 50);
    }
  }, [selectedPerson]);

  const handleAdd = async () => {
    if (!selectedPerson || !amount) return;
    setSaving(true);
    try {
      await udharKhataService.addEntry(selectedPerson.id, {
        entryType,
        amount: Number(amount),
        remark: remark ?? "",
        entryDate: entryDate.split("T")[0],
      });
      setSaved(true);
      onSuccess?.();
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error("Failed to add udhar entry:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-xl border border-slate-200 shadow-2xl">
        {/* Header */}
        <DialogHeader className="px-5 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#005eb0]/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-[#005eb0]" />
            </div>
            <div>
              <DialogTitle className="text-sm font-black text-slate-800 tracking-tight">
                Add Udhar Khata Entry
              </DialogTitle>
              {remark && (
                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate max-w-[280px]">
                  Remark: {remark}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="p-5 space-y-4">
          {/* Search person */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
              Account
            </label>
            <input
              ref={inputRef}
              className="w-full text-xs px-3 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-[#005eb0] outline-none transition-all bg-white font-medium"
              placeholder="Search by name or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Person list */}
            {search.length > 0 && (
              <div className="mt-1.5 border border-slate-200 rounded-lg overflow-hidden shadow-lg max-h-48 overflow-y-auto">
                {filtered.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4 font-medium">
                    No accounts found
                  </p>
                ) : (
                  filtered.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPerson(p);
                        setSearch("");
                      }}
                      className="w-full flex items-center justify-between px-4 py-2.5 text-xs hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="text-left">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-slate-400 font-mono text-[10px] mt-0.5">
                          {p.phone}
                        </p>
                      </div>
                      {selectedPerson?.id === p.id && (
                        <Check className="w-3.5 h-3.5 text-[#005eb0]" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Selected person chip */}
            {selectedPerson && (
              <div className="mt-2 flex items-center justify-between px-3 py-2 bg-[#005eb0]/5 border border-[#005eb0]/20 rounded-lg">
                <div>
                  <p className="text-xs font-black text-[#005eb0]">
                    {selectedPerson.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {selectedPerson.phone}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPerson(null)}
                  className="p-1 rounded-full hover:bg-slate-200 text-slate-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Entry type + Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Type
              </label>
              <Select
                value={entryType}
                onValueChange={(v) => setEntryType(v as "liya" | "diya")}
              >
                <SelectTrigger className="w-full h-10 text-xs font-black border-slate-300 focus:ring-2 focus:ring-blue-500/20 focus:border-[#005eb0]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem
                    value="liya"
                    className="text-xs font-bold text-emerald-700"
                  >
                    LIYA (+) — Received
                  </SelectItem>
                  <SelectItem
                    value="diya"
                    className="text-xs font-bold text-rose-600"
                  >
                    DIYA (-) — Given
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                  ₹
                </span>
                <input
                  ref={amountRef}
                  type="number"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full h-10 pl-6 pr-3 text-xs font-black text-right border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-[#005eb0] outline-none transition-all bg-white"
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
            </div>
          </div>

          {/* Summary preview */}
          {selectedPerson && amount && (
            <div
              className={cn(
                "px-4 py-3 rounded-lg border text-xs font-bold transition-all",
                entryType === "liya"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800",
              )}
            >
              {entryType === "liya" ? "▲ LIYA" : "▼ DIYA"} ₹
              {Number(amount).toLocaleString("en-IN")} from/to{" "}
              {selectedPerson.name}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 h-10 text-xs font-bold border-slate-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAdd}
              disabled={!selectedPerson || !amount || saving || saved}
              className={cn(
                "flex-1 h-10 text-xs font-black transition-all",
                saved
                  ? "bg-emerald-500 hover:bg-emerald-500 text-white"
                  : "bg-[#005eb0] hover:bg-[#004a8c] text-white",
              )}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" /> Saved!
                </>
              ) : (
                "+ Add Udhar Entry"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
