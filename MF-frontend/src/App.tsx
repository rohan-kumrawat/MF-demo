import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Pages
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import ReceiptPage from "./pages/ReceiptPage";
import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentCustomers from "./pages/agent/AgentCustomers";
import AgentCollect from "./pages/agent/AgentCollect";
import AgentHistory from "./pages/agent/AgentHistory";
import AgentProfile from "./pages/agent/AgentProfile";
import { AgentLayout } from "./layouts/AgentLayout";
import { CustomerLayout } from "./layouts/CustomerLayout";
import CustomerHome from "@/feature/customer/pages/CustomerHome";
import CustomerDiary from "@/feature/customer/pages/CustomerDiary";
import CustomerLoan from "@/feature/customer/pages/CustomerLoan";
import CustomerProfile from "@/feature/customer/pages/CustomerProfile";

// Admin shell + pages
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "@/feature/admin/dashboard";
import {
  CustomerListPage,
  CustomerDetailPage,
} from "@/feature/admin/customers";
import { DiaryPage as SavingsDiaryPage } from "@/feature/admin/diary";
import { LoansPage } from "@/feature/admin/loans";
import CreateLoanPage from "@/feature/admin/loans/pages/CreateLoanPage";
import CollectionsReportPage from "@/feature/admin/loans/pages/CollectionsReportPage";
// import { CollectionPage } from "@/feature/admin/collections";
import {
  DailyRegisterPage,
  DailyRegisterPrintPage,
} from "@/feature/admin/daily-register";
import {
  UdharKhataPage,
  KhatedarDetailPage,
} from "@/feature/admin/udhar-khata";
import { AgentsPage } from "@/feature/admin/agents";
import { KioskUsersPage } from "@/feature/admin/kiosk-users";
import { ReportsPage, TransactionHistoryPage } from "@/feature/admin/reports";
import { VaultPage } from "@/feature/admin/vault/pages/VaultPage";
import TransactionsDayPrintPage from "@/feature/admin/reports/pages/TransactionsDayPrintPage";
// import DaybookPage from "./pages/admin/DaybookPage"; // Still legacy for now if exists

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Standalone Print Route */}
          <Route
            path="/receipt/:txId"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent"]}>
                <ReceiptPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/daily-register/print/:dayId"
            element={
              <ProtectedRoute allowedRoles={["admin", "kiosk"]}>
                <DailyRegisterPrintPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports/print/:date"
            element={
              <ProtectedRoute allowedRoles={["admin", "agent"]}>
                <TransactionsDayPrintPage />
              </ProtectedRoute>
            }
          />

          {/* Admin — protected, nested inside layout shell */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="customers" element={<CustomerListPage />} />
            <Route path="customers/:id" element={<CustomerDetailPage />} />
            <Route path="diary" element={<SavingsDiaryPage />} />
            <Route path="loans" element={<LoansPage />} />
            <Route path="loans/create" element={<CreateLoanPage />} />
            <Route
              path="loans/collection-report"
              element={<CollectionsReportPage />}
            />
            {/* <Route path="collection" element={<CollectionPage />} />
            <Route path="daybook" element={<DaybookPage />} /> */}
            <Route path="daily-register" element={<DailyRegisterPage />} />
            <Route path="udhar-khata" element={<UdharKhataPage />} />
            <Route path="udhar-khata/:id" element={<KhatedarDetailPage />} />
            <Route path="agents" element={<AgentsPage />} />
            <Route path="kiosk-users" element={<KioskUsersPage />} />
            <Route path="vault" element={<VaultPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="transactions" element={<TransactionHistoryPage />} />
          </Route>

          {/* Kiosk — protected, uses same AdminLayout shell (filtered nav) */}
          <Route
            path="/kiosk"
            element={
              <ProtectedRoute allowedRoles={["kiosk"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/kiosk/daily-register" replace />}
            />
            <Route path="daily-register" element={<DailyRegisterPage />} />
            <Route path="udhar-khata" element={<UdharKhataPage />} />
            <Route path="udhar-khata/:id" element={<KhatedarDetailPage />} />
          </Route>

          {/* Agent — protected, nested inside mobile-first layout */}
          <Route
            path="/agent"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <AgentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AgentDashboard />} />
            <Route path="customers" element={<AgentCustomers />} />
            <Route path="collect" element={<AgentCollect />} />
            <Route path="history" element={<AgentHistory />} />
            <Route path="profile" element={<AgentProfile />} />
          </Route>

          {/* Customer — protected, nested inside mobile-first layout */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <CustomerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<CustomerHome />} />
            <Route path="diary" element={<CustomerDiary />} />
            <Route path="loan" element={<CustomerLoan />} />
            <Route path="profile" element={<CustomerProfile />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
