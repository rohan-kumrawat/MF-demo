// src/feature/customer/pages/CustomerHome.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerHome } from "../hooks/useCustomerHome";
import { formatRupee } from "@/data/demoData";

import {
  LogOut,
  BookOpen,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useCustomerProfile } from "../hooks/useCustomerProfile";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CustomerHome: React.FC = () => {
  const navigate = useNavigate();
  const {
    loanSummary,
    totalDiaryBalance,
    diaryAccounts,
    isLoading,
    isError,
    refetch,
  } = useCustomerHome();
  const { logout } = useAuthStore();
  const { user: profileUser, isLoading: isProfileLoading } =
    useCustomerProfile();

  if (isError) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Something went wrong
        </h2>
        <p className="text-gray-500">
          Could not load your account details. Please try again later.
        </p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2 bg-primary text-white rounded-xl font-bold"
        >
          Retry
        </button>
      </div>
    );
  }

  // Note: user info actually comes from useAuthStore in the hook, but for the banner we want user.name
  // Let's use a safer way to get user name if loanSummary isn't ready

  return (
    <div className="-mx-4 -mt-6 pb-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Gradient Banner */}
      <div className="bg-primary pt-12 pb-16 px-6 rounded-b-[3rem] text-white relative shadow-xl">
        <button
          onClick={logout}
          className="absolute top-6 right-6 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
        >
          <LogOut size={18} />
        </button>

        <div className="space-y-1">
          <p className="text-white/80 font-medium tracking-wide">Namaste,</p>
          <h2 className="text-3xl font-black tracking-tight">
            {isProfileLoading ? (
              <Skeleton className="h-9 w-32 bg-white/20" />
            ) : (
              profileUser?.name
            )}
          </h2>
          {!isProfileLoading && (profileUser as any)?.customerCode && (
            <div className="pt-1">
              <span className="text-sm font-mono text-white bg-white/20 px-2 py-0.5 rounded-md tracking-wider inline-block">
                {(profileUser as any).customerCode}
              </span>
            </div>
          )}
          <p className="text-xs text-white/60 font-bold uppercase tracking-widest pt-2">
            Member since {profileUser?.memberSince || "2024"}
          </p>
        </div>
      </div>

      {/* Summary Cards Container */}
      <div className="px-4 mt-10 grid grid-cols-2 gap-4">
        {/* Savings Diary Card */}
        <Card
          size="sm"
          className="cursor-pointer hover:shadow-md transition-all active:scale-[0.98] border-none bg-white"
          onClick={() => navigate("/customer/diary")}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-0">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex flex-col gap-0.5">
              <span>Savings</span>
              {diaryAccounts.length === 1 && diaryAccounts[0].accountCode && (
                <span className="text-[8px] font-mono opacity-70">
                  {diaryAccounts[0].accountCode}
                </span>
              )}
            </CardTitle>
            <CardAction>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <BookOpen size={16} />
              </div>
            </CardAction>
          </CardHeader>
          <CardContent className="pb-4">
            {isLoading ? (
              <Skeleton className="h-7 w-24 mb-1" />
            ) : (
              <p className="text-xl font-black text-gray-900">
                {formatRupee(totalDiaryBalance)}
              </p>
            )}
            <div className="flex items-center gap-1">
              <TrendingUp size={10} className="text-green-500" />
              <p className="text-[10px] text-gray-400 font-bold uppercase">
                {diaryAccounts.length > 1
                  ? `${diaryAccounts.length} Diary Accounts`
                  : "Diary Balance"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Active Loan Card */}
        {isLoading ? (
          <Card size="sm" className="animate-pulse border-none bg-white">
            <CardHeader className="pb-0">
              <Skeleton className="h-3 w-12" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </CardContent>
          </Card>
        ) : loanSummary && loanSummary.activeLoans > 0 ? (
          <Card
            size="sm"
            className={cn(
              "cursor-pointer hover:shadow-md transition-all active:scale-[0.98] border-none bg-white",
              loanSummary.totalOverdue > 0
                ? "ring-1 ring-red-100"
                : "ring-1 ring-amber-50",
            )}
            onClick={() => navigate("/customer/loan")}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex flex-col gap-0.5">
                <span>Active Loan</span>
                {loanSummary.loans[0]?.loanAccountNumber && (
                  <span className="text-[8px] font-mono opacity-70">
                    {loanSummary.loans[0].loanAccountNumber}
                  </span>
                )}
              </CardTitle>
              <CardAction>
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    loanSummary.totalOverdue > 0
                      ? "bg-red-50 text-red-600"
                      : "bg-amber-50 text-amber-600",
                  )}
                >
                  <CreditCard size={16} />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent className="pb-4">
              <p className="text-xl font-black text-gray-900">
                {formatRupee(Number(loanSummary.loans[0].remainingBalance))}
              </p>
              <div className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    loanSummary.totalOverdue > 0
                      ? "bg-red-500 animate-pulse"
                      : "bg-green-500",
                  )}
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase">
                  {loanSummary.totalOverdue > 0 ? "Overdue" : "On Track"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card
            size="sm"
            className="flex flex-col items-center justify-center border-dashed border-gray-200 bg-gray-50/50"
          >
            <CreditCard size={16} className="text-gray-300 mb-2" />
            <p className="text-[10px] text-gray-400 font-bold uppercase">
              No Active Loan
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CustomerHome;
