// src/feature/customer/hooks/useCustomerLoan.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import customerPortalService from "../services/customerPortal.service";
import { useState, useMemo } from "react";

export const useCustomerLoan = () => {
  const { user, _hasHydrated } = useAuthStore();
  const customerId = user?.id;

  const summaryQuery = useQuery({
    queryKey: ["customer-loan-summary", customerId],
    queryFn: () => customerPortalService.getLoanSummary(customerId!),
    enabled: _hasHydrated && !!customerId,
  });

  const [explicitLoanId, setSelectedLoanId] = useState<string | null>(null);

  const selectedLoanId = useMemo(() => {
    if (explicitLoanId) return explicitLoanId;
    const loans = summaryQuery.data?.loans;
    if (!loans?.length) return null;
    return (loans.find((l) => l.status === "active") ?? loans[0]).id;
  }, [explicitLoanId, summaryQuery.data]);

  const scheduleQuery = useQuery({
    queryKey: ["customer-loan-schedule", selectedLoanId],
    queryFn: () => customerPortalService.getLoanSchedule(selectedLoanId!),
    enabled: !!selectedLoanId,
  });

  return {
    loanSummary: summaryQuery.data,
    selectedLoanId,
    setSelectedLoanId,
    schedule: scheduleQuery.data || [],
    isLoading: summaryQuery.isLoading || scheduleQuery.isLoading,
    isError: summaryQuery.isError || scheduleQuery.isError,
    refetch: () => {
      summaryQuery.refetch();
      if (selectedLoanId) scheduleQuery.refetch();
    },
  };
};
