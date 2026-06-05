// src/feature/customer/components/GuaranteedLoansSection.tsx
import { ShieldCheck, Users, Banknote, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRupee } from "@/data/demoData";
import { cn } from "@/lib/utils";
import type { GuaranteedLoanSummary } from "@/types/loan.types";

interface Props {
  guaranteedLoans?: GuaranteedLoanSummary[];
  totalGuaranteedPrincipal?: number;
  compact?: boolean;
}

function statusClass(status: GuaranteedLoanSummary["status"]) {
  if (status === "active") return "bg-green-100 text-green-700 border-none";
  if (status === "closed") return "bg-gray-100 text-gray-700 border-none";
  return "bg-amber-100 text-amber-700 border-none";
}

export function GuaranteedLoansSection({
  guaranteedLoans = [],
  totalGuaranteedPrincipal,
  compact = false,
}: Props) {
  const hasLoans = guaranteedLoans.length > 0;

  return (
    <Card
      className={cn(
        "border-none bg-white shadow-sm",
        compact ? "rounded-2xl" : "rounded-[2rem]",
      )}
    >
      <CardHeader className={cn("pb-3", compact ? "px-4 pt-4" : "px-5 pt-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-sm font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <ShieldCheck className="size-4 text-amber-600" />
              Guaranteed Loans
            </CardTitle>
            <p className="text-xs text-gray-500 font-medium">
              Loans where you are listed as a guarantor.
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              {hasLoans ? `${guaranteedLoans.length} Records` : "No Records"}
            </p>
            {typeof totalGuaranteedPrincipal === "number" && hasLoans && (
              <p className="text-xs font-black text-amber-700">
                {formatRupee(totalGuaranteedPrincipal)}
              </p>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent
        className={cn("space-y-3", compact ? "px-4 pb-4" : "px-5 pb-5")}
      >
        {hasLoans ? (
          guaranteedLoans.map((loan) => (
            <div
              key={loan.id}
              className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-black text-gray-900">
                      {loan.loanAccountNumber}
                    </p>
                    <Badge
                      className={cn(
                        "text-[9px] font-bold uppercase tracking-wide",
                        statusClass(loan.status),
                      )}
                    >
                      {loan.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    Borrower: {loan.customer?.name || "Unknown"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Principal
                  </p>
                  <p className="text-sm font-black text-gray-900">
                    {formatRupee(Number(loan.principalAmount || 0))}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white/80 p-3 border border-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <Banknote size={10} />
                    Remaining
                  </p>
                  <p className="font-black text-gray-900 mt-1">
                    {formatRupee(Number(loan.remainingBalance || 0))}
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 border border-amber-100">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-1.5">
                    <Users size={10} />
                    Relation
                  </p>
                  <p className="font-black text-gray-900 mt-1">
                    {loan.guarantorMatch?.relation || "Guarantor"}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={10} />
                  {loan.loanType}
                </span>
                <span>{loan.guarantorMatch?.name || "Selected customer"}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-5 text-center">
            <ShieldCheck className="size-5 mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-bold text-gray-700">
              No guarantee records found.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              If you are added as a guarantor on a loan, it will show here.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
