// src/feature/admin/daily-register/components/UdharKhataCellAddEntry.tsx
// Compact trigger button for the "Add" row — opens UdharKhataModal
import { useState } from "react";
import { BookOpen, Check } from "lucide-react";
import { UdharKhataModal } from "./UdharKhataModal";
import { cn } from "@/lib/utils";
import type { FormState } from "../types";

interface UdharKhataCellAddEntryProps {
  addForm: FormState;
  isAdding: boolean;
}

export function UdharKhataCellAddEntry({
  addForm,
  isAdding,
}: UdharKhataCellAddEntryProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const handleSuccess = () => {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 3000);
  };

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        disabled={isAdding}
        className={cn(
          "w-full h-full px-3 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-tight transition-all focus:outline-none disabled:opacity-50",
          justSaved
            ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            : "text-[#005eb0] hover:bg-blue-50",
        )}
        title="Add Udhar Khata entry for this row"
      >
        {justSaved ? (
          <>
            <Check className="w-3 h-3 shrink-0" />
            <span>Saved</span>
          </>
        ) : (
          <>
            <BookOpen className="w-3 h-3 shrink-0" />
            <span>+Udhar</span>
          </>
        )}
      </button>

      <UdharKhataModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        remark={addForm.remark}
        entryDate={new Date().toISOString()}
        initialPerson={
          addForm.udharKhata
            ? { id: addForm.udharKhata.id, name: addForm.udharKhata.name }
            : null
        }
        initialAmount={addForm.amount}
        onSuccess={handleSuccess}
      />
    </>
  );
}
