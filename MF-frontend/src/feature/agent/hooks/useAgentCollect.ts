import { useState, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { localToday } from "@/lib/utils";
import { generateIdempotencyKey } from "../../../lib/idempotency";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { agentService } from "../services/agentService";
import type { AgentCustomer, ApiLoan, CreateTransactionDto } from "../types";

function isDueSoon(dueDate: string | null, withinDays: number): boolean {
  if (!dueDate) return false;
  const diff = (new Date(dueDate).getTime() - Date.now()) / 86400000;
  return diff >= 0 && diff <= withinDays;
}

type EmiStatus = "green" | "yellow" | "orange" | "red";

function mapToAgentCustomer(
  customer: any,
  loans: ApiLoan[],
  diaries: any[],
): AgentCustomer {
  const customerLoans = loans.filter((l) => l.customerId === customer.id);
  const loan = customerLoans[0]; // primary loan for display/status
  const diary = diaries.find((d) => d.customerId === customer.id);

  const emiStatus: EmiStatus = loan
    ? loan.overdue > 10000
      ? "red"
      : loan.overdue > 0
        ? "orange"
        : isDueSoon(loan.nextEmiDueDate, 2)
          ? "yellow"
          : "green"
    : "green";

  return {
    id: customer.id,
    loanId: loan?.id ?? "",
    loans: customerLoans,
    diaryAccountId: diary?.id,
    diaryName: diary?.diaryName,
    name: customer.name ?? "Unknown",
    phone: customer.phone ?? "",
    accountNo: loan?.loanAccountNumber ?? "No Active Loan",
    emi:
      loan?.emiAmount ??
      loan?.weeklyInstallment ??
      loan?.dailyInstallment ??
      null,
    emiStatus,
    emiLabel: loan
      ? loan.overdue > 0
        ? `₹${loan.overdue.toLocaleString("en-IN")} overdue`
        : loan.nextEmiDueDate
          ? `Due ${loan.nextEmiDueDate}`
          : "Up to date"
      : "No Dues",
    diaryBalance: diary?.balance ?? 0,
    risk: loan
      ? loan.overdue > 10000
        ? "High"
        : loan.overdue > 0
          ? "Medium"
          : "Low"
      : "Low",
  };
}

export function useAgentCollect(agentId: string) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch customers for this agent/center — filtered server-side by name
  const { data: rawCustomers = [], isLoading: isCustomersLoading } = useQuery({
    queryKey: ["agentCustomers", debouncedSearch],
    queryFn: () =>
      agentService.getCustomers(
        debouncedSearch ? { name: debouncedSearch } : undefined,
      ),
  });

  // Fetch active loans to link with customers
  const { data: loans = [], isLoading: isLoansLoading } = useQuery({
    queryKey: ["agentLoans", agentId],
    queryFn: () => agentService.getActiveLoans(),
  });

  // Fetch diary accounts
  const { data: diaries = [], isLoading: isDiariesLoading } = useQuery({
    queryKey: ["agentDiaries", agentId],
    queryFn: () => agentService.getDiaryAccounts(),
  });

  // Map raw API customers to view-model — server already filtered by name
  const filteredCustomers = rawCustomers.map((c) =>
    mapToAgentCustomer(c, loans, diaries),
  );

  const loanTxKeyRef = useRef<string | null>(null);
  const diaryTxKeyRef = useRef<string | null>(null);

  const loanMutation = useMutation({
    mutationFn: ({
      loanId,
      dto,
    }: {
      loanId: string;
      dto: CreateTransactionDto;
    }) => {
      if (!loanTxKeyRef.current)
        loanTxKeyRef.current = generateIdempotencyKey();
      return agentService.submitTransaction(loanId, dto, loanTxKeyRef.current);
    },
    onSuccess: () => {
      loanTxKeyRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["agentLoans", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agentDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["agentDiaries", agentId] });
      queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
      queryClient.invalidateQueries({ queryKey: ["diarySummary"] });
      queryClient.invalidateQueries({ queryKey: ["agentTrends", agentId] });
      queryClient.invalidateQueries({ queryKey: ["reports", "transactions"] });
    },
  });

  const diaryMutation = useMutation({
    mutationFn: ({
      accountId,
      amount,
      notes,
    }: {
      accountId: string;
      amount: number;
      notes?: string;
    }) => {
      if (!diaryTxKeyRef.current)
        diaryTxKeyRef.current = generateIdempotencyKey();
      return agentService.submitDiaryDeposit(
        accountId,
        amount,
        notes,
        diaryTxKeyRef.current,
      );
    },
    onSuccess: () => {
      diaryTxKeyRef.current = null;
      queryClient.invalidateQueries({ queryKey: ["agentDiaries", agentId] });
      queryClient.invalidateQueries({ queryKey: ["agentDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["loans", "dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["collection-report"] });
      queryClient.invalidateQueries({ queryKey: ["agents-summary"] });
      queryClient.invalidateQueries({ queryKey: ["diarySummary"] });
      queryClient.invalidateQueries({ queryKey: ["agentTrends", agentId] });
      queryClient.invalidateQueries({ queryKey: ["reports", "transactions"] });
    },
  });

  const submitCollection = async (
    customer: AgentCustomer,
    dto: Partial<CreateTransactionDto>,
  ) => {
    const amount = Number(dto.amount) || 0;
    const diaryAmount = Number(dto.diaryAmount) || 0;

    // Case 1: Standalone Diary Deposit (No EMI, only diary)
    if (amount === 0 && diaryAmount > 0) {
      if (!customer.diaryAccountId)
        throw new Error("Customer has no diary account");
      const result = await diaryMutation.mutateAsync({
        accountId: customer.diaryAccountId,
        amount: diaryAmount,
        notes: dto.notes,
      });
      return {
        receiptNo: `D-${result.id.slice(-6).toUpperCase()}`,
        customerName: customer.name,
        amount: diaryAmount,
      };
    }

    // Case 2: EMI Payment (possibly with combined diary deposit)
    if (amount > 0) {
      if (!customer.loanId) throw new Error("Customer has no active loan");

      const fullDto: CreateTransactionDto = {
        type: "emi",
        amount: amount,
        diaryAmount: diaryAmount > 0 ? diaryAmount : undefined,
        diaryAccountId: diaryAmount > 0 ? customer.diaryAccountId : undefined,
        paymentMode: dto.paymentMode ?? "cash",
        paymentDate: localToday(),
        notes: dto.notes,
      };

      const result = await loanMutation.mutateAsync({
        loanId: customer.loanId,
        dto: fullDto,
      });
      return {
        receiptNo: result.receiptNo,
        customerName: customer.name,
        amount: result.amount + (result.diaryAmount || 0),
      };
    }

    throw new Error("Invalid transaction amount");
  };

  return {
    filteredCustomers,
    searchQuery,
    setSearchQuery,
    submitCollection,
    isLoading: isCustomersLoading || isLoansLoading || isDiariesLoading,
  };
}
