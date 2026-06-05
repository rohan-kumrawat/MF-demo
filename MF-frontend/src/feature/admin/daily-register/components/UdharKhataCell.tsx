// src/feature/admin/daily-register/components/UdharKhataCell.tsx
// Compact trigger button — opens UdharKhataModal on click
import { useState } from "react";
import { BookOpen, Check } from "lucide-react";
import { UdharKhataModal } from "./UdharKhataModal";
import { cn } from "@/lib/utils";

interface UdharKhataCellProps {
  remark?: string;
  entryDate: string;
}

export function UdharKhataCell({ remark, entryDate }: UdharKhataCellProps) {
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
        className={cn(
          "w-full h-full px-3 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-tight transition-all focus:outline-none",
          justSaved
            ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
            : "text-[#005eb0] hover:bg-blue-50",
        )}
        title="Add Udhar Khata entry"
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
        remark={remark}
        entryDate={entryDate}
        onSuccess={handleSuccess}
      />
    </>
  );
}
