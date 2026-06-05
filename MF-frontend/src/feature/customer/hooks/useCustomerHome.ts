// src/feature/customer/hooks/useCustomerHome.ts
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import customerPortalService from "../services/customerPortal.service";
import { useDiaryAccounts } from "./useDiaryAccounts";

export const useCustomerHome = () => {
  const { user, _hasHydrated } = useAuthStore();
  const customerId = user?.id;

  const summaryQuery = useQuery({
    queryKey: ["customer-loan-summary", customerId],
    queryFn: () => customerPortalService.getLoanSummary(customerId!),
    enabled: _hasHydrated && !!customerId,
  });

  const {
    accounts: diaryAccounts,
    totalBalance: totalDiaryBalance,
    isLoading: isDiariesLoading,
    isError: isDiariesError,
    refetch: refetchDiaries,
  } = useDiaryAccounts();

  return {
    loanSummary: summaryQuery.data,
    diaryAccounts,
    totalDiaryBalance,
    isLoading: summaryQuery.isLoading || isDiariesLoading,
    isError: summaryQuery.isError || isDiariesError,
    refetch: () => {
      summaryQuery.refetch();
      refetchDiaries();
    },
  };
};
