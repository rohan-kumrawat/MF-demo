// src/pages/agent/AgentCollect.tsx
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { Search, PlusCircle } from "lucide-react";
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

const AgentCollect: React.FC = () => {
  const { user } = useAuthStore();
  const agentId = user?.id || "a1";
  const { filteredCustomers, searchQuery, setSearchQuery, submitCollection } =
    useAgentCollect(agentId);
  const location = useLocation();

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

  // Handle pre-selection from navigation state (e.g. from Dashboard)
  useEffect(() => {
    const customerId = location.state?.customerId;
    if (customerId && filteredCustomers) {
      const customer = filteredCustomers.find((c) => c?.id === customerId);
      if (customer) {
        // Defer to avoid "setState in effect" warning
        Promise.resolve().then(() => {
          setSelectedCustomer(customer);
        });
      }
    }
  }, [location.state, filteredCustomers]);

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
      <div>
        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="text-primary" size={24} />
          New Collection
        </h2>
        <p className="text-sm text-gray-500 font-medium">
          Search for a client to record a payment.
        </p>
      </div>

      <Combobox
        onValueChange={(id) => {
          const customer = filteredCustomers?.find((c) => c.id === id);
          if (customer) setSelectedCustomer(customer);
        }}
      >
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10"
            size={20}
          />
          <ComboboxInput
            placeholder="Search by name, phone or account number..."
            className="pl-12 h-16 rounded-2xl border-gray-100 shadow-lg focus:ring-primary/20 transition-all text-lg w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus={!selectedCustomer}
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

      {searchQuery && searchQuery.length > 0 ? (
        <div className="space-y-4">
          <h3 className="px-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            Search Results ({filteredCustomers?.length ?? 0})
          </h3>
          {filteredCustomers && filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => (
              <CustomerSearchCard
                key={customer.id}
                customer={customer}
                onCollect={handleCollect}
              />
            ))
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
              <p className="text-sm text-gray-400 font-medium">
                No results found.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-primary/5 rounded-[2.5rem] p-10 text-center border border-primary/10">
          <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-primary mx-auto mb-4 shadow-sm">
            <Search size={32} />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Find a Customer</h3>
          <p className="text-xs text-gray-500 max-w-[200px] mx-auto leading-relaxed">
            Start typing to search through your assigned customers and record
            payments.
          </p>
        </div>
      )}

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

export default AgentCollect;
