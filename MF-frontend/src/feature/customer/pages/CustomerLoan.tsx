// src/feature/customer/pages/CustomerLoan.tsx
import React from "react";
import { useCustomerLoan } from "../hooks/useCustomerLoan";
import { formatRupee } from "@/data/demoData";
import {
  CreditCard,
  AlertCircle,
  Calendar,
  TrendingUp,
  Receipt,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { GuaranteedLoansSection } from "../components/GuaranteedLoansSection";

const CustomerLoan: React.FC = () => {
  const { loanSummary, schedule, isLoading, isError } = useCustomerLoan();
  const guaranteedLoans = loanSummary?.guaranteedLoans ?? [];
  const hasDirectLoans = (loanSummary?.loans?.length ?? 0) > 0;
  const hasAnyLoanData = hasDirectLoans || guaranteedLoans.length > 0;

  if (isError) {
    return (
      <div className="p-4 pt-10">
        <Alert variant="destructive" className="rounded-3xl border-2">
          <AlertCircle className="size-5" />
          <AlertTitle className="font-bold">
            Loan Details Unavailable
          </AlertTitle>
          <AlertDescription>
            We're having trouble loading your loan account. Please try again
            later or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const activeLoan =
    loanSummary?.loans?.find((loan) => loan.status === "active") ||
    loanSummary?.loans?.[0];

  if (!isLoading && !hasAnyLoanData) {
    return (
      <div className="p-4 pt-6">
        <Card className="rounded-[2.5rem] border-dashed border-2 border-muted text-center py-12">
          <CardContent className="flex flex-col items-center gap-4">
            <div className="size-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
              <CreditCard size={32} />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-xl font-bold">
                No Active Loans
              </CardTitle>
              <CardDescription className="text-sm max-w-[220px] mx-auto">
                When you take a loan or get added as a guarantor, the details
                will appear here.
              </CardDescription>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = activeLoan
    ? (Number(activeLoan.totalPaid) / Number(activeLoan.totalPayable)) * 100
    : 0;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-lg mx-auto">
      <Card className="rounded-[2.5rem] shadow-md border-border/50 border-l-8 border-l-amber-500 overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3 min-w-0">
            <div className="space-y-1 min-w-0 flex-1">
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {activeLoan ? "Loan Account" : "No Direct Loan"}
              </CardDescription>
              <CardTitle className="text-lg font-black tracking-tight truncate">
                {activeLoan?.loanAccountNumber || "---"}
              </CardTitle>
            </div>
            <div className="size-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-inner">
              <TrendingUp size={24} />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {activeLoan ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
                <div className="space-y-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Principal
                  </p>
                  <p className="text-lg sm:text-xl font-black text-foreground leading-tight tabular-nums truncate">
                    {formatRupee(Number(activeLoan.principalAmount || 0))}
                  </p>
                </div>
                <div className="text-left sm:text-right space-y-1 min-w-0">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Outstanding
                  </p>
                  <p className="text-lg sm:text-xl font-black text-amber-600 leading-tight tabular-nums truncate sm:ml-auto">
                    {formatRupee(Number(activeLoan.remainingBalance || 0))}
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-end">
                  <Badge
                    variant="outline"
                    className="bg-amber-50/50 text-amber-700 border-amber-200 font-bold text-[10px]"
                  >
                    {activeLoan.emisPaid || 0} / {activeLoan.totalEmis || 0}{" "}
                    INSTALLMENTS PAID
                  </Badge>
                  <span className="text-xs font-black text-amber-600">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2.5 bg-muted" />
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-amber-200 bg-amber-50/40 p-5 text-center space-y-2">
              <CreditCard className="size-6 mx-auto text-amber-500" />
              <p className="text-sm font-bold text-gray-800">
                You don’t have a direct loan account.
              </p>
              <p className="text-xs text-gray-500">
                Your guarantor records are shown below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-foreground flex items-center gap-2">
            <Calendar className="text-amber-500" size={18} />
            Repayment Schedule
          </h3>
          <Badge
            variant="secondary"
            className="font-bold text-[9px] uppercase tracking-tighter"
          >
            {activeLoan ? `${schedule.length} Installments` : "No Direct Loan"}
          </Badge>
        </div>

        <Card className="rounded-2xl border-border/50 overflow-hidden">
          <Table>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="p-4">
                      <div className="flex items-center gap-4">
                        <Skeleton className="size-10 rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right p-4">
                      <Skeleton className="h-6 w-16 ml-auto rounded-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : activeLoan && schedule.length > 0 ? (
                schedule.map((item, idx) => (
                  <TableRow
                    key={idx}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center bg-muted/50 rounded-xl p-2 min-w-12 border border-border/30">
                          <p className="text-[9px] font-bold text-muted-foreground uppercase leading-none mb-1">
                            EMI
                          </p>
                          <p className="text-sm font-black text-foreground leading-none">
                            #
                            {item.emiNumber ||
                              item.installmentNumber ||
                              idx + 1}
                          </p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-black text-foreground">
                            {formatRupee(item.expectedAmount)}
                          </p>
                          <p className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                            <Calendar size={10} />
                            {item.dueDate
                              ? new Date(item.dueDate).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )
                              : "Upcoming"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right p-4">
                      <div className="flex flex-col items-end gap-1.5">
                        <Badge
                          className={cn(
                            "font-bold text-[9px] uppercase tracking-tighter px-2",
                            item.status === "paid"
                              ? "bg-green-100 text-green-700 hover:bg-green-100 border-none"
                              : item.status === "overdue"
                                ? "bg-red-100 text-red-700 hover:bg-red-100 border-none"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-100 border-none",
                          )}
                        >
                          {item.status}
                        </Badge>
                        {item.status === "paid" && item.receiptNo && (
                          <span className="flex items-center gap-1 text-[8px] font-bold text-muted-foreground uppercase">
                            <Receipt size={10} />
                            {item.receiptNo}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    className="h-32 text-center text-muted-foreground"
                  >
                    <Info className="size-8 mx-auto mb-2 opacity-20" />
                    <p className="text-xs font-medium">
                      {activeLoan
                        ? "Schedule not generated yet."
                        : "No direct loan schedule to display."}
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>

      <GuaranteedLoansSection
        guaranteedLoans={loanSummary?.guaranteedLoans}
        totalGuaranteedPrincipal={loanSummary?.totalGuaranteedPrincipal}
      />
    </div>
  );
};

export default CustomerLoan;
