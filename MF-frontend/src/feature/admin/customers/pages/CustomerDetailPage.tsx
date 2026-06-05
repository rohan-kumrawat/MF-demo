import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePageShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  useCustomer,
  useCustomerLoanSummary,
  CustomerHeader,
  LoanTab,
  LedgerTab,
} from "..";
import { DiaryAccountsTab } from "../components/tabs/DiaryAccountsTab";

type Tab = "diary" | "accounts" | "loan" | "ledger";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("diary");
  usePageShortcuts("customer-detail", [
    { key: "1", action: () => setTab("diary"), description: "Savings Diary" },
    {
      key: "2",
      action: () => setTab("accounts"),
      description: "Diary Accounts",
    },
    { key: "3", action: () => setTab("loan"), description: "Loan & EMI" },
    { key: "4", action: () => setTab("ledger"), description: "Ledger" },
    {
      key: "n",
      action: () => setTab("accounts"),
      description: "Add Deposit",
    },
    { key: "Escape", action: () => navigate(-1), description: "Go back" },
  ]);

  const { data: customer, isLoading: loadingCustomer } = useCustomer(id!);
  const { data: loanSummary } = useCustomerLoanSummary(id);

  if (loadingCustomer) {
    return (
      <div className="h-40 flex justify-center items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (!customer)
    return (
      <div className="p-10 text-center font-bold text-muted-foreground">
        Customer not found
      </div>
    );

  return (
    <div className="p-4 md:p-6 space-y-4 animate-in fade-in duration-500 max-w-full pb-10">
      {/* Back button is now inside CustomerHeader */}
      <CustomerHeader customer={customer} />

      {/* Compact Tabs */}
      <div className="flex border-b border-border/60 overflow-x-auto no-scrollbar">
        {[
          { id: "diary", label: "Diary Accounts" },
          { id: "loan", label: "Loan & EMI" },
          { id: "ledger", label: "Ledger" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as Tab)}
            className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
              tab === t.id
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
        {tab === "diary" && <DiaryAccountsTab customerId={id!} />}
        {tab === "loan" && (
          <LoanTab customerId={id!} loanSummary={loanSummary} />
        )}
        {tab === "ledger" && <LedgerTab id={id!} />}
      </div>
    </div>
  );
}
