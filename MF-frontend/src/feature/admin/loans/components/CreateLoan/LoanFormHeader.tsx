// src/feature/admin/loans/components/CreateLoan/LoanFormHeader.tsx
import { PlusCircle } from "lucide-react";

export function LoanFormHeader() {
  return (
    <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-ambient overflow-hidden">
      <div className="gradient-primary p-6 flex items-center gap-4">
        <div className="size-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
          <PlusCircle className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">
            New Loan Application
          </h2>
          <p className="text-white/80 text-sm font-medium mt-1">
            Fill in the application form details to disburse a loan
          </p>
        </div>
      </div>
    </div>
  );
}
