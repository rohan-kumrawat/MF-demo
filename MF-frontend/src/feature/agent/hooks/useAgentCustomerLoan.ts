// src/feature/agent/hooks/useAgentCustomerLoan.ts
/**
 * Used when an agent selects a customer to view or collect against.
 * Fetches the full loan summary for that customer via:
 *   GET /loans/customers/:customerId/summary
 *
 * This eliminates the need to fetch all loans and filter client-side.
 * The summary also includes aggregate stats (totalOutstanding, totalOverdue)
 * that are useful for the agent's collect modal.
 */
import { useQuery } from "@tanstack/react-query";
import { agentService } from "../services/agentService";
import type { CustomerLoanSummary, LoanSummaryItem } from "../types";

export function useAgentCustomerLoan(customerId: string | null) {
  const query = useQuery<CustomerLoanSummary>({
    queryKey: ["agentCustomerLoanSummary", customerId],
    queryFn: () => agentService.getCustomerLoanSummary(customerId!),
    enabled: !!customerId,
    staleTime: 30_000, // 30s — avoids refetching on every modal open
  });

  // Derive the primary active loan for quick access
  const activeLoan: LoanSummaryItem | undefined = query.data?.loans.find(
    (l) => l.status === "active",
  );

  return {
    summary: query.data ?? null,
    activeLoan: activeLoan ?? null,
    loans: query.data?.loans ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
