// src/feature/admin/loans/types.ts
// Re-export from global types — single source of truth
export type {
  Loan,
  LoanType,
  LoanStatus,
  PaymentMode,
  TransactionType,
  Guarantor,
  CreateLoanDto,
  UpdateLoanDto,
  LoanFilters,
  DashboardStats,
  CollectionReport,
  CustomerLoanSummary,
  ScheduleItem,
  Transaction,
  CreateTransactionDto,
  EditTransactionDto,
} from "@/types/loan.types";
