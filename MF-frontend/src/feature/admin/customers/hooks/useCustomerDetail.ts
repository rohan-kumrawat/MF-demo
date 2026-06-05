import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { loansService } from "@/services/admin/loans.service";
import { diaryService } from "@/services/admin/diary.service";
import { agentService } from "../../../agent/services/agentService";
import { customersService } from "../services/customersService";
import { customerFilesService } from "../services/customerFilesService";
import type { DiaryActionDto } from "@/types/diary.types";

export function useCustomerLoanSummary(customerId?: string) {
  return useQuery({
    queryKey: ["loan-summary", customerId],
    queryFn: () => agentService.getCustomerLoanSummary(customerId!),
    enabled: !!customerId,
  });
}

export function useLoanSchedule(loanId?: string) {
  return useQuery({
    queryKey: ["loan-schedule", loanId],
    queryFn: () => loansService.getSchedule(loanId!),
    enabled: !!loanId,
  });
}

export function useCustomerDiary(customerId?: string) {
  return useQuery({
    queryKey: ["diary-accounts", customerId],
    queryFn: async () => {
      const accounts = await diaryService.getAll();
      const account = accounts.find((a: any) => a.customerId === customerId);
      if (!account) return { account: {}, transactions: [] };

      const transactions = await diaryService.getTransactions(account.id);
      return { account, transactions };
    },
    enabled: !!customerId,
  });
}

/** Fetch all diary accounts for a customer via the dedicated API. */
export function useCustomerDiaryAccounts(customerId?: string) {
  return useQuery({
    queryKey: ["customer-diary-accounts", customerId],
    queryFn: () => customersService.getCustomerDiaryAccounts(customerId!),
    enabled: !!customerId,
  });
}

export function useCustomerDiaryAccountTransactions(accountId: string) {
  return useQuery({
    queryKey: ["customer-diary-account-transactions", accountId],
    queryFn: () => diaryService.getTransactions(accountId),
    enabled: !!accountId,
  });
}

export function useCustomerDiaryMutation(customerId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      accountId,
      dto,
    }: {
      accountId: string;
      dto: DiaryActionDto;
    }) => {
      return await diaryService.deposit(accountId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["diary-accounts", customerId],
      });
      queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
    },
  });
}

export function useCustomerDiaryAccountMutation(
  customerId?: string,
  accountId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: DiaryActionDto) => diaryService.deposit(accountId!, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-diary-account-transactions", accountId],
      });
      queryClient.invalidateQueries({
        queryKey: ["customer-diary-accounts", customerId],
      });
      queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
    },
  });
}

export function useCustomerLoanFiles(customerId?: string, loanId?: string) {
  return useQuery({
    queryKey: ["customer-loan-files", customerId, loanId],
    queryFn: () => customerFilesService.getCustomerFiles(customerId!, loanId),
    enabled: !!customerId && !!loanId,
  });
}

export function useUploadCustomerLoanFiles(
  customerId?: string,
  loanId?: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      files: File[];
      documentType: string;
      description?: string;
    }) => {
      if (!customerId || !loanId) {
        throw new Error("Customer and loan are required");
      }

      return customerFilesService.uploadLoanFiles({
        customerId,
        loanId,
        files: payload.files,
        documentType: payload.documentType,
        description: payload.description,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["customer-loan-files", customerId, loanId],
      });
    },
  });
}
