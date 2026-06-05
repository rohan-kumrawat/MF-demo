// src/feature/admin/diary/hooks/useDiary.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { diaryService } from "../services/diaryService";
import type {
  DiaryActionDto,
  CreateDiaryAccountDto,
  EditDiaryTransactionDto,
} from "../types";

const QUERY_KEYS = {
  accounts: () => ["diary", "accounts"] as const,
  account: (id: string) => ["diary", "accounts", id] as const,
  transactions: (id: string) =>
    ["diary", "accounts", id, "transactions"] as const,
};

export function useDiaryAccounts() {
  return useQuery({
    queryKey: QUERY_KEYS.accounts(),
    queryFn: diaryService.getAll,
  });
}

export function useDiarySummary(from?: string, to?: string, date?: string) {
  const key = ["diary", "summary", from || "", to || "", date || ""] as const;
  return useQuery({
    queryKey: key,
    queryFn: () => diaryService.getSummary(from, to, date),
  });
}

export function useDiaryAccount(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.account(id),
    queryFn: () => diaryService.getById(id),
    enabled: !!id,
  });
}

export function useDiaryTransactions(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(id),
    queryFn: () => diaryService.getTransactions(id),
    enabled: !!id,
  });
}

export function useCreateDiaryAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateDiaryAccountDto) => diaryService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-diary-accounts"] });
    },
  });
}

export function useUpdateDiaryAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { diaryName: string } }) =>
      diaryService.update(id, dto),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.account(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer-diary-accounts"] });
    },
  });
}

export function useDiaryMutations() {
  const queryClient = useQueryClient();

  const depositKeyRef = useRef<string | null>(null);
  const withdrawKeyRef = useRef<string | null>(null);
  const interestKeyRef = useRef<string | null>(null);

  const invalidate = (id: string) => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.account(id) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(id) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
    queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["collection-report"] });
    queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
  };

  const deposit = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DiaryActionDto }) => {
      if (!depositKeyRef.current)
        depositKeyRef.current = generateIdempotencyKey();
      return diaryService.deposit(id, dto, depositKeyRef.current);
    },
    onSuccess: (_, { id }) => {
      depositKeyRef.current = null;
      invalidate(id);
    },
  });

  const withdraw = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DiaryActionDto }) => {
      if (!withdrawKeyRef.current)
        withdrawKeyRef.current = generateIdempotencyKey();
      return diaryService.withdraw(id, dto, withdrawKeyRef.current);
    },
    onSuccess: (_, { id }) => {
      withdrawKeyRef.current = null;
      invalidate(id);
    },
  });

  const postInterest = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: DiaryActionDto }) => {
      if (!interestKeyRef.current)
        interestKeyRef.current = generateIdempotencyKey();
      return diaryService.postInterest(id, dto, interestKeyRef.current);
    },
    onSuccess: (_, { id }) => {
      interestKeyRef.current = null;
      invalidate(id);
    },
  });

  return {
    deposit,
    withdraw,
    postInterest,
    isDepositing: deposit.isPending,
    isWithdrawing: withdraw.isPending,
    isPostingInterest: postInterest.isPending,
  };
}

export function usePersonSearch(query: string) {
  const debouncedQuery = useDebounce(query, 300);
  return useQuery({
    queryKey: ["diary", "persons", "search", debouncedQuery],
    queryFn: () => diaryService.searchPersons(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
  });
}

// ── Admin-only Transaction Mutations ─────────────────────────────────────────

/**
 * ADMIN ONLY — Edit an existing diary transaction.
 * Invalidates account + transactions cache on success.
 */
export function useEditDiaryTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      accountId,
      txId,
      dto,
    }: {
      accountId: string;
      txId: string;
      dto: EditDiaryTransactionDto;
    }) => diaryService.editTransaction(accountId, txId, dto),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.account(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions(accountId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
      queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
    },
  });
}

/**
 * ADMIN ONLY — Permanently delete a diary transaction.
 * Backend recalculates all balances; we invalidate the full account tree.
 */
export function useDeleteDiaryTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ accountId, txId }: { accountId: string; txId: string }) =>
      diaryService.deleteTransaction(accountId, txId),
    onSuccess: (_, { accountId }) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.account(accountId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions(accountId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
      queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
    },
  });
}

/**
 * ADMIN ONLY — Soft delete a diary account.
 * Invalidates all diary queries on success.
 */
export function useDeleteDiaryAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (accountId: string) => diaryService.deleteAccount(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.accounts() });
      queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
    },
  });
}
