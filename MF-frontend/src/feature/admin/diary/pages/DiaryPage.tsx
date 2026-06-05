// src/feature/admin/diary/pages/DiaryPage.tsx
import { useState, useMemo, useCallback } from "react";
import { Search, X, BookOpen, Plus } from "lucide-react";
import { useDiaryAccounts, useDiarySummary } from "../hooks/useDiary";
import { DiaryAccountCard } from "../components/DiaryAccountCard";
import { DiaryDetailView } from "../components/DiaryDetailView";
import { AddDiaryAccountModal } from "../components/AddDiaryAccountModal";
import { DiarySummaryCards } from "../components/DiarySummaryCards";
import type { DiaryAccount } from "../types";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { formatCurrency } from "@/lib/utils";

export default function DiaryPage() {
  const [search, setSearch] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<DiaryAccount | null>(
    null,
  );
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<DiaryAccount | null>(
    null,
  );

  const { data: accounts = [], isLoading } = useDiaryAccounts();

  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const isoToday = format(new Date(), "yyyy-MM-dd");

  // Date range filter for per-period summary
  const formatFilterDate = (value: string | undefined) => {
    if (!value) return "";
    try {
      return format(parseISO(value), "dd/MM/yyyy");
    } catch {
      return value;
    }
  };

  // State for from date
  const [fromIso, setFromIso] = useState<string>(isoToday);

  // State for to date
  const [toIso, setToIso] = useState<string>(isoToday);

  // Sync handler for from date
  const handleFromDateChange = (newIso: string) => {
    setFromIso(newIso);
  };

  // Sync handler for to date
  const handleToDateChange = (newIso: string) => {
    setToIso(newIso);
  };

  const { data: dateSummary } = useDiarySummary(fromIso, toIso);

  const filteredAccounts = useMemo(() => {
    const q = search.toLowerCase();
    return accounts.filter(
      (acc) =>
        acc.id.toLowerCase().includes(q) ||
        acc.customerId.toLowerCase().includes(q) ||
        acc.customer?.name?.toLowerCase().includes(q) ||
        acc.diaryName?.toLowerCase().includes(q) ||
        acc.accountCode?.toLowerCase().includes(q),
    );
  }, [accounts, search]);

  const handleSelectAccount = useCallback((acc: DiaryAccount) => {
    setSelectedAccount(acc);
  }, []);

  if (selectedAccount) {
    return (
      <DiaryDetailView
        account={selectedAccount}
        onBack={() => setSelectedAccount(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner className="size-8 text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Loading Savings Accounts...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 w-full flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
            <BookOpen className="w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tight text-foreground">
              Savings Diary
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Manage informal savings and daily deposits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap w-full sm:w-auto">
          <div className="relative w-full sm:w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts or customers..."
              className="pl-9 pr-9 h-11 rounded-xl bg-card border-muted-foreground/20 focus:ring-primary/20"
            />
            {search && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSearch("")}
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          <Button
            onClick={() => setAddModalOpen(true)}
            className="h-11 px-6 gap-2 font-bold rounded-xl shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            <Plus className="w-4 h-4" strokeWidth={3} /> Add Account
          </Button>
        </div>
      </div>

      {/* Summary Section */}
      {!search && <DiarySummaryCards />}

      {/* Date range filter row */}
      {!search && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                From Date (DD/MM/YYYY)
              </label>
              <Popover open={fromOpen} onOpenChange={setFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-44 h-10 justify-start text-left font-normal text-sm border-2 border-indigo-200 bg-card hover:border-indigo-300"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70 text-indigo-600" />
                    {fromIso ? formatFilterDate(fromIso) : "DD/MM/YYYY"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromIso ? parseISO(fromIso) : undefined}
                    onSelect={(date) => {
                      handleFromDateChange(
                        date ? format(date, "yyyy-MM-dd") : "",
                      );
                      setFromOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                To Date (DD/MM/YYYY)
              </label>
              <Popover open={toOpen} onOpenChange={setToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full sm:w-44 h-10 justify-start text-left font-normal text-sm border-2 border-teal-200 bg-card hover:border-teal-300"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-70 text-teal-600" />
                    {toIso ? formatFilterDate(toIso) : "DD/MM/YYYY"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toIso ? parseISO(toIso) : undefined}
                    onSelect={(date) => {
                      handleToDateChange(
                        date ? format(date, "yyyy-MM-dd") : "",
                      );
                      setToOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Card className="border-none shadow-md bg-gradient-to-br from-green-500/10 to-green-600/5 rounded-2xl hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-[11px] font-bold text-green-700/70 dark:text-green-400/70 uppercase tracking-wider">
                  Payments In
                </p>
                <p className="text-2xl font-black text-green-700 dark:text-green-400 tracking-tight">
                  {formatCurrency(dateSummary?.dateDeposits || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-[11px] font-bold text-red-700/70 dark:text-red-400/70 uppercase tracking-wider">
                  Payments Out
                </p>
                <p className="text-2xl font-black text-red-700 dark:text-red-400 tracking-tight">
                  {formatCurrency(dateSummary?.dateWithdrawals || 0)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-md bg-gradient-to-br from-blue-500/10 to-blue-600/5 rounded-2xl hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-[11px] font-bold text-blue-700/70 dark:text-blue-400/70 uppercase tracking-wider">
                  Balance (Net)
                </p>
                <p
                  className={`text-2xl font-black tracking-tight ${(dateSummary?.dateNetChange || (dateSummary?.dateDeposits || 0) - (dateSummary?.dateWithdrawals || 0)) >= 0 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
                >
                  {formatCurrency(
                    dateSummary?.dateNetChange ||
                      (dateSummary?.dateDeposits || 0) -
                        (dateSummary?.dateWithdrawals || 0),
                  )}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Grid */}
      {filteredAccounts.length === 0 ? (
        <Card className="border-dashed border-2 bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-base font-bold text-foreground">
              {search ? "No matches found" : "No savings accounts found"}
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-[280px]">
              {search
                ? "Try adjusting your search terms or filters to find what you're looking for."
                : "Get started by creating a new savings account for a customer."}
            </p>
            {!search && (
              <Button
                variant="outline"
                onClick={() => setAddModalOpen(true)}
                className="mt-6 font-bold rounded-xl"
              >
                Create First Account
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredAccounts.map((acc) => (
            <DiaryAccountCard
              key={acc.id}
              account={acc}
              onClick={() => handleSelectAccount(acc)}
              onEdit={(acc) => {
                setEditingAccount(acc);
                setAddModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <AddDiaryAccountModal
        open={addModalOpen}
        initialData={editingAccount}
        onClose={() => {
          setAddModalOpen(false);
          setEditingAccount(null);
        }}
      />
    </div>
  );
}
