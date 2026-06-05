// src/feature/customer/hooks/useDiaryAccounts.ts
import { useQueries } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import customerPortalService from "../services/customerPortal.service";
import { useMemo } from "react";

export const useDiaryAccounts = () => {
  const { diaryIds, _hasHydrated } = useAuthStore();

  const diaryQueries = useQueries({
    queries: (diaryIds || []).map((id) => ({
      queryKey: ["customer-diary-account", id],
      queryFn: () => customerPortalService.getDiaryAccount(id),
      enabled: _hasHydrated && !!id,
    })),
  });

  const accounts = useMemo(
    () => diaryQueries.map((q) => q.data).filter(Boolean),
    [diaryQueries],
  );

  const totalBalance = useMemo(
    () => accounts.reduce((sum, acc) => sum + (Number(acc?.balance) || 0), 0),
    [accounts],
  );

  const isLoading = diaryQueries.some((q) => q.isLoading);
  const isError = diaryQueries.some((q) => q.isError);

  return {
    accounts,
    totalBalance,
    isLoading,
    isError,
    refetch: () => diaryQueries.forEach((q) => q.refetch()),
  };
};
