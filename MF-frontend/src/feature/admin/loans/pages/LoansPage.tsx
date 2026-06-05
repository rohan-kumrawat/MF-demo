// src/feature/admin/loans/pages/LoansPage.tsx
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, FileText, PlusCircle, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLoansQuery, useLoansDashboard } from "../hooks/useLoans";
import { LoanDashboardCards } from "../components/LoanDashboardCards";
import { LoanFiltersBar } from "../components/LoanFiltersBar";
import { LoanTable } from "../components/LoanTable";
import { LoanDetailView } from "../components/LoanDetailView";
import type { Loan, LoanFilters } from "../types";

export default function LoansPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<LoanFilters>({});
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const {
    data: loans = [],
    isLoading: loansLoading,
    error,
  } = useLoansQuery(filters);
  const { data: dashboard } = useLoansDashboard();

  // Fallback lookup for APIs that don't embed the customer object yet.
  // Once the backend always returns loan.customer.name, this becomes a no-op.
  const customerNames = useMemo<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    loans.forEach((l) => {
      if (!map[l.customerId]) {
        map[l.customerId] = l.customer?.name ?? l.loanAccountNumber;
      }
    });
    return map;
  }, [loans]);

  const handleFiltersChange = useCallback((f: LoanFilters) => {
    setFilters(f);
  }, []);

  const handleSelectLoan = useCallback((loan: Loan) => {
    setSelectedLoan(loan);
  }, []);

  const handleNewLoan = () => {
    navigate("/admin/loans/create");
  };

  // ── Detail View ────────────────────────────────────────────────────────
  if (selectedLoan) {
    return (
      <LoanDetailView
        loan={selectedLoan}
        customerName={
          customerNames[selectedLoan.customerId] ??
          selectedLoan.loanAccountNumber
        }
        onBack={() => setSelectedLoan(null)}
      />
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────
  if (loansLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/10 via-sky-500/10 to-violet-500/10 shadow-sm flex items-center justify-center border border-cyan-100">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-600" />
        </div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Loading Loans...
        </p>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────

  // ── List View ──────────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in bg-gradient-to-b from-background via-background to-muted/20">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-4 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/10 via-sky-500/10 to-violet-500/10 flex items-center justify-center border border-cyan-100">
            <FileText className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h2
              className="text-xl font-black text-foreground"
              style={{ fontFamily: "Manrope, sans-serif" }}
            >
              Loans
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {loans.length} loans found
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/loans/collection-report")}
            className="rounded-xl font-bold gap-2 border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 shadow-sm active:scale-95"
          >
            <BarChart3 className="w-4 h-4" /> Collections Report
          </Button>
          <Button
            onClick={handleNewLoan}
            className="gradient-primary text-white px-5 rounded-xl font-bold gap-2 transition-all active:scale-95 shadow-sm shadow-primary/20"
          >
            <PlusCircle className="w-4 h-4" /> New Loan
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboard && <LoanDashboardCards stats={dashboard} />}

      {/* Filters */}
      <LoanFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Table */}
      <LoanTable
        loans={loans}
        onSelect={handleSelectLoan}
        customerNames={customerNames}
        error={error}
        onClearFilters={() => handleFiltersChange({})}
      />
    </div>
  );
}
