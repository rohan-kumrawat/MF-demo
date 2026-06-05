import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoanTab } from "./tabs/LoanTab";
import { LedgerTab } from "./tabs/LedgerTab";
import { DiaryAccountsTab } from "./tabs/DiaryAccountsTab";

interface CustomerTabsProps {
  loanSummary: any;
  emiSchedule: any;
  customer: any;
}

export function CustomerTabs({ loanSummary, customer }: CustomerTabsProps) {
  return (
    <Tabs defaultValue="diary" className="w-full space-y-6">
      <div className="flex items-center justify-between border-b border-border/50 pb-px overflow-x-auto scrollbar-hide">
        <TabsList className="bg-transparent h-auto p-0 gap-8 rounded-none">
          <TabsTrigger
            value="diary"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-bold text-muted-foreground data-[state=active]:text-primary transition-all uppercase tracking-widest"
          >
            Diary / Savings
          </TabsTrigger>
          <TabsTrigger
            value="loan"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-bold text-muted-foreground data-[state=active]:text-primary transition-all uppercase tracking-widest"
          >
            Loan Management
          </TabsTrigger>
          <TabsTrigger
            value="ledger"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-3 text-sm font-bold text-muted-foreground data-[state=active]:text-primary transition-all uppercase tracking-widest"
          >
            Full Ledger
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="diary" className="outline-none">
        <DiaryAccountsTab customerId={customer?.id} />
      </TabsContent>

      <TabsContent value="loan" className="outline-none">
        <LoanTab customerId={customer?.id} loanSummary={loanSummary} />
      </TabsContent>

      <TabsContent value="ledger" className="outline-none">
        <LedgerTab id={customer?.id} />
      </TabsContent>
    </Tabs>
  );
}

// Re-export sub-components for flexibility if needed
export { DiaryAccountsTab } from "./tabs/DiaryAccountsTab";
export { LoanTab, LedgerTab };
