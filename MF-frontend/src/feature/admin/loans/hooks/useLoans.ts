// src/feature/admin/loans/hooks/useLoans.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { generateIdempotencyKey } from "@/lib/idempotency";
import { useAuthStore } from "@/store/authStore";
import { loansService } from "../services/loansService";
import type {
  LoanFilters,
  CreateTransactionDto,
  CreateLoanDto,
  EditTransactionDto,
} from "../types";

const QUERY_KEYS = {
  loans: (filters?: LoanFilters) => ["loans", filters] as const,
  loan: (id: string) => ["loans", id] as const,
  dashboard: () => ["loans", "dashboard"] as const,
  schedule: (id: string) => ["loans", id, "schedule"] as const,
  transactions: (id: string) => ["loans", id, "transactions"] as const,
  collectionReport: (params?: {
    from?: string;
    to?: string;
    agentId?: string;
  }) => ["loans", "collectionReport", params] as const,
};

// ── List + Dashboard ──────────────────────────────────────────────────────
export function useLoansQuery(filters?: LoanFilters) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: QUERY_KEYS.loans(filters),
    queryFn: () => loansService.getAll(filters),
    staleTime: 1000 * 30, // 30s for financial data
    enabled: hasHydrated,
  });
}

export function useLoansDashboard() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: QUERY_KEYS.dashboard(),
    queryFn: loansService.getDashboard,
    enabled: hasHydrated,
  });
}

// ── Single Loan + Schedule + Transactions ─────────────────────────────────
export function useLoan(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.loan(id),
    queryFn: () => loansService.getById(id),
    enabled: !!id,
  });
}

export function useLoanSchedule(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.schedule(id),
    queryFn: () => loansService.getSchedule(id),
    enabled: !!id,
  });
}

export function useLoanTransactions(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.transactions(id),
    queryFn: () => loansService.getTransactions(id),
    enabled: !!id,
  });
}

export function useCollectionReport(
  params?: { from?: string; to?: string; agentId?: string },
  enabled = false,
) {
  return useQuery({
    queryKey: QUERY_KEYS.collectionReport(params),
    queryFn: () => loansService.getCollectionReport(params),
    enabled,
    staleTime: 1000 * 60,
  });
}

// ── Mutations ─────────────────────────────────────────────────────────────
export function useLoanMutations() {
  const queryClient = useQueryClient();

  const addTxKeyRef = useRef<string | null>(null);

  const invalidateLoans = () => {
    queryClient.invalidateQueries({ queryKey: ["loans"] });
  };

  const addTransaction = useMutation({
    mutationFn: ({
      loanId,
      dto,
    }: {
      loanId: string;
      dto: CreateTransactionDto;
    }) => {
      if (!addTxKeyRef.current) addTxKeyRef.current = generateIdempotencyKey();
      return loansService.addTransaction(loanId, dto, addTxKeyRef.current);
    },
    onSuccess: (_, { loanId }) => {
      addTxKeyRef.current = null;
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loan(loanId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions(loanId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(loanId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
      queryClient.invalidateQueries({ queryKey: ["diary", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["diary", "summary"] });
    },
  });

  const preClose = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      loansService.preClose(id, notes),
    onSuccess: invalidateLoans,
  });

  const reverseTransaction = useMutation({
    mutationFn: ({
      loanId,
      txId,
      notes,
    }: {
      loanId: string;
      txId: string;
      notes: string;
    }) => loansService.reverseTransaction(loanId, txId, notes),
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loan(loanId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions(loanId),
      });
      queryClient.invalidateQueries({ queryKey: ["diary", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["diary", "summary"] });
    },
  });

  const createLoan = useMutation({
    mutationFn: (dto: CreateLoanDto) => loansService.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const updateLoan = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: import("../types").UpdateLoanDto;
    }) => loansService.update(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loan(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(id) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });

  const renewBullet = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: {
        paymentDate: string;
        paymentMode: string;
        notes?: string;
        diaryAmount?: number;
        diaryAccountId?: string;
      };
    }) => loansService.renewBullet(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loan(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(id) });
    },
  });

  const applyBulletPenalty = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: { notes?: string } }) =>
      loansService.applyBulletPenalty(id, dto),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loan(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.transactions(id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(id) });
    },
  });

  return {
    addTransaction,
    preClose,
    reverseTransaction,
    createLoan,
    updateLoan,
    renewBullet,
    applyBulletPenalty,
    isAddingTransaction: addTransaction.isPending,
    isPreClosing: preClose.isPending,
    isReversing: reverseTransaction.isPending,
    isCreatingLoan: createLoan.isPending,
    isUpdatingLoan: updateLoan.isPending,
    isRenewingBullet: renewBullet.isPending,
    isApplyingPenalty: applyBulletPenalty.isPending,
  };
}

// ── Admin-only Transaction Mutations ─────────────────────────────────────────

/**
 * ADMIN ONLY — Edit an existing loan transaction.
 * Only sends the fields that changed; `type` cannot be modified.
 * Invalidates the loan, its transactions, and its schedule on success.
 */
export function useEditLoanTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      loanId,
      txId,
      dto,
    }: {
      loanId: string;
      txId: string;
      dto: EditTransactionDto;
    }) => loansService.editTransaction(loanId, txId, dto),
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loan(loanId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions(loanId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(loanId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
      queryClient.invalidateQueries({ queryKey: ["diary", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["diary", "summary"] });
    },
  });
}

/**
 * ADMIN ONLY — Permanently delete a loan transaction.
 * Backend recalculates loan balances; we invalidate the full loan tree.
 */
export function useDeleteLoanTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ loanId, txId }: { loanId: string; txId: string }) =>
      loansService.deleteTransaction(loanId, txId),
    onSuccess: (_, { loanId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.loan(loanId) });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.transactions(loanId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.schedule(loanId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboard() });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
    },
  });
}

/**
 * ADMIN ONLY — Delete a loan and all its transactions permanently.
 */
export function useDeleteLoan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => loansService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] }); // Invalidate customer summary
      queryClient.invalidateQueries({ queryKey: ["diary", "accounts"] });
      queryClient.invalidateQueries({ queryKey: ["diary", "summary"] });
    },
  });
}
