// src/feature/customer/pages/CustomerDiary.tsx
import React from "react";
import { useCustomerDiary } from "../hooks/useCustomerDiary";
import { formatRupee } from "@/data/demoData";
import {
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  AlertCircle,
  Calendar,
  History,
} from "lucide-react";
import { cn, formatDisplayDate } from "@/lib/utils";

const CustomerDiary: React.FC = () => {
  const {
    accounts,
    account,
    selectedAccountId,
    setSelectedAccountId,
    transactions,
    isLoading,
    isError,
  } = useCustomerDiary();
  const currentBalance = Number(account?.balance || 0);

  if (isError) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">
          Unable to load transactions
        </h2>
        <p className="text-gray-500 text-sm">
          Please check your connection or try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Account Selector (Multiple Diaries) */}
      {!isLoading && accounts.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {accounts.map((acc) => (
            <button
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={cn(
                "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                selectedAccountId === acc.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-white text-gray-400 border border-gray-100 hover:border-gray-200",
              )}
            >
              <div className="flex flex-col items-center gap-0.5">
                <span>Account {acc.diaryName || "-"}</span>
                {acc.accountCode && (
                  <span className="text-[8px] font-mono opacity-80 uppercase tracking-widest">
                    {acc.accountCode}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Header Card */}
      <div className="bg-primary p-8 rounded-4xl text-white shadow-xl shadow-secondary/20 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-white/80">
            <BookOpen size={18} />
            <h2 className="text-sm font-bold uppercase tracking-widest">
              Savings Diary
            </h2>
            {account?.accountCode && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono tracking-wider">
                {account.accountCode}
              </span>
            )}
          </div>

          <div className="space-y-1">
            {isLoading ? (
              <div className="h-10 w-32 bg-white/20 animate-pulse rounded" />
            ) : (
              <p
                className={cn(
                  "text-4xl font-black tracking-tight",
                  currentBalance < 0 ? "text-red-200" : "text-white",
                )}
              >
                {formatRupee(account?.balance || 0)}
              </p>
            )}
            <p className="text-xs text-white/60 font-medium">
              {currentBalance < 0 ? "Overdrawn Balance" : "Available Balance"}
            </p>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center gap-2 text-[10px] font-bold text-white/70 uppercase tracking-wider">
            <Calendar size={12} />
            Opened: {formatDisplayDate(account?.createdAt)}
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Transactions Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-gray-900 flex items-center gap-2">
            <History className="text-secondary" size={18} />
            Transaction History
          </h3>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {transactions.length} Entries
          </span>
        </div>

        <div className="bg-white rounded-4xl border border-gray-100 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-4 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-100 rounded w-24" />
                    <div className="h-3 bg-gray-100 rounded w-40" />
                  </div>
                  <div className="w-16 h-4 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="divide-y divide-gray-50">
              {transactions.map((tx) => {
                const isCredit =
                  tx.type.toLowerCase() === "deposit" ||
                  tx.type.toLowerCase() === "interest";
                return (
                  <div
                    key={tx.id}
                    className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        isCredit
                          ? "bg-green-50 text-green-600"
                          : "bg-amber-50 text-amber-600",
                      )}
                    >
                      {isCredit ? (
                        <ArrowDownLeft size={20} />
                      ) : (
                        <ArrowUpRight size={20} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-tight">
                        {new Date(tx.transactionDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </p>
                      <p className="text-sm font-black text-gray-800 truncate">
                        {tx.notes || (isCredit ? "Deposit" : "Withdrawal")}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={cn(
                          "text-sm font-black",
                          isCredit ? "text-green-600" : "text-amber-600",
                        )}
                      >
                        {isCredit ? "+" : "-"}
                        {formatRupee(tx.amount).replace("₹", "")}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-bold uppercase",
                          Number(tx.balanceAfter) < 0
                            ? "text-red-600"
                            : "text-gray-400",
                        )}
                      >
                        Bal: {formatRupee(tx.balanceAfter).replace("₹", "")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <BookOpen size={24} />
              </div>
              <p className="text-sm text-gray-500 font-medium">
                No transactions found for this account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDiary;
