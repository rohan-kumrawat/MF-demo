// src/feature/admin/loans/index.ts
export { default as LoansPage } from "./pages/LoansPage";

export * from "./types";
export * from "./hooks/useLoans";

export * from "./services/loansService";

export { PreCloseLoanModal } from "./components/PreCloseLoanModal";
export { ReverseTransactionModal } from "./components/ReverseTransactionModal";
export { CollectionsReportModal } from "./components/CollectionsReportModal";
