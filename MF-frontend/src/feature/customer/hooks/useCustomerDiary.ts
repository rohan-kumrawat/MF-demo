// src/feature/customer/hooks/useCustomerDiary.ts
import { useQuery } from "@tanstack/react-query";
import customerPortalService from "../services/customerPortal.service";
import { useMemo, useState } from "react";
import { useDiaryAccounts } from "./useDiaryAccounts";

export const useCustomerDiary = () => {
  const {
    accounts,
    isLoading: isAccountsLoading,
    isError: isAccountsError,
    refetch: refetchAccounts,
  } = useDiaryAccounts();

  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null,
  );

  const account = useMemo(
    () =>
      accounts.find((acc) => acc.id === selectedAccountId) ||
      accounts[0] ||
      null,
    [accounts, selectedAccountId],
  );

  const transactionsQuery = useQuery({
    queryKey: ["customer-diary-transactions", account?.id],
    queryFn: () => customerPortalService.getDiaryTransactions(account!.id),
    enabled: !!account?.id,
  });

  return {
    accounts,
    account,
    selectedAccountId,
    setSelectedAccountId,
    transactions: transactionsQuery.data || [],
    isLoading: isAccountsLoading || transactionsQuery.isLoading,
    isError: isAccountsError || transactionsQuery.isError,
    refetch: () => {
      refetchAccounts();
      if (account?.id) transactionsQuery.refetch();
    },
  };
};
