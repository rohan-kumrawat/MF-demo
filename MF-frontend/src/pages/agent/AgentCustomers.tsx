// src/pages/agent/AgentCustomers.tsx
import React, { useState } from "react";
import {
  useAgentCollect,
  useAgentCustomerLoan,
  CustomerSearchCard,
  CollectModal,
  showReceiptToast,
  type AgentCustomer,
  type CreateTransactionDto,
  type LoanSummaryItem,
} from "../../feature/agent";
import { useAuthStore } from "../../store/authStore";
import { Search, Users } from "lucide-react";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "../../components/ui/combobox";

/**
 * Adapts LoanSummaryItem to ApiLoan shape so CollectModal
 * can render loan selectors without changing its interface.
 */
function adaptSummaryToApiLoan(item: LoanSummaryItem) {
  return {
    id: item.id,
    loanAccountNumber: item.loanAccountNumber,
    customerId: "", // not needed for modal display
    agentId: "",
    loanType: item.loanType,
    emiAmount: item.emiAmount ?? null,
    dailyInstallment: item.dailyInstallment ?? null,
    weeklyInstallment: item.weeklyInstallment ?? null,
    status: item.status,
    totalPaid: 0,
    remainingBalance: item.remainingBalance,
    overdue: item.overdue,
    totalEmis: item.totalEmis ?? null,
    emisPaid: item.emisPaid ?? null,
    emisRemaining: item.emisRemaining ?? null,
    nextEmiDueDate: item.nextEmiDueDate,
    startDate: "",
    endDate: "",
  };
}

const AgentCustomers: React.FC = () => {
  const { user } = useAuthStore();
  const agentId = user?.id || "a1";
  const {
    filteredCustomers,
    searchQuery,
    setSearchQuery,
    submitCollection,
    isLoading,
  } = useAgentCollect(agentId);

  const [selectedCustomer, setSelectedCustomer] =
    useState<AgentCustomer | null>(null);

  // Fetch the selected customer's full loan summary from the API
  const { loans: customerLoans, isLoading: isLoanSummaryLoading } =
    useAgentCustomerLoan(selectedCustomer?.id ?? null);

  // Merge the fresh loan summary into the customer view-model for the modal
  const customerWithLiveLoanData: AgentCustomer | null = selectedCustomer
    ? {
        ...selectedCustomer,
        // Override loans with freshly fetched data from summary API
        loans: customerLoans.map(adaptSummaryToApiLoan),
        // Update primary loanId to the first active loan from the summary
        loanId:
          customerLoans.find((l) => l.status === "active")?.id ??
          selectedCustomer.loanId,
      }
    : null;

  const handleCollect = (customer: AgentCustomer) => {
    setSelectedCustomer(customer);
  };

  const handleSubmission = async (
    customer: AgentCustomer,
    dto: Partial<CreateTransactionDto>,
  ) => {
    const result = await submitCollection(customer, dto);
    showReceiptToast({
      receiptNo: result.receiptNo,
      customerName: result.customerName,
      amount: result.amount,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <Users className="text-primary" size={24} />
          My Clients
        </h2>
        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
          {filteredCustomers?.length ?? 0} Total
        </span>
      </div>

      <Combobox
        onValueChange={(id) => {
          const customer = filteredCustomers?.find((c) => c.id === id);
          if (customer) {
            document
              .getElementById(`customer-${id}`)
              ?.scrollIntoView({ behavior: "smooth" });
          }
        }}
      >
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10"
            size={20}
          />
          <ComboboxInput
            placeholder="Search by name, phone or account number..."
            className="pl-12 h-14 rounded-2xl border-gray-100 shadow-sm focus:ring-primary/20 transition-all text-base w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <ComboboxContent className="w-(--anchor-width) mt-2">
          <ComboboxList>
            {filteredCustomers?.map((customer) => (
              <ComboboxItem key={customer.id} value={customer.id}>
                <div className="flex flex-col py-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {customer.name}
                    </span>
                    {customer.diaryName && (
                      <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] font-bold">
                        {customer.diaryName}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">
                    {customer.phone}
                  </span>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxList>
          <ComboboxEmpty>
            No customers found matching "{searchQuery}"
          </ComboboxEmpty>
        </ComboboxContent>
      </Combobox>

      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredCustomers && filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer) => (
            <CustomerSearchCard
              key={customer.id}
              customer={customer}
              onCollect={handleCollect}
            />
          ))
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-sm text-gray-400 font-medium">
              No customers found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* CollectModal receives live loan data from the summary API */}
      <CollectModal
        customer={customerWithLiveLoanData}
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        onSubmit={handleSubmission}
        isLoadingLoans={isLoanSummaryLoading}
      />
    </div>
  );
};

export default AgentCustomers;
