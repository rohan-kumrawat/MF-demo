import { Download, Loader2, Printer } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDisplayDate } from "@/lib/utils";
import { useCombinedTransactions } from "@/feature/admin/reports/hooks/useReports";
import { Badge } from "@/components/ui/badge";

interface LedgerTabProps {
  id: string; // customerId
}

export function LedgerTab({ id }: LedgerTabProps) {
  const { data, isLoading, isError } = useCombinedTransactions({
    customerId: id,
    limit: 200,
  });

  const transactions = data?.data || [];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl font-bold gap-2 border-primary/20 text-primary hover:bg-primary/5"
        >
          <Download className="w-4 h-4" /> Download Statement
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 border-b border-border/50">
                <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Date
                </TableHead>
                <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Receipt No
                </TableHead>
                <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Source
                </TableHead>
                <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Type
                </TableHead>
                <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                  Amount
                </TableHead>
                <TableHead className="px-6 h-10 text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-right">
                  Agent
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <p>Loading transactions...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : isError ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-destructive"
                  >
                    Failed to load transactions.
                  </TableCell>
                </TableRow>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="px-6 py-3 text-xs font-medium text-muted-foreground">
                      {formatDisplayDate(tx.paymentDate)}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-[11px] font-mono text-muted-foreground uppercase">
                      {tx.receiptNo || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-xs font-bold text-foreground">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0 h-5 border ${
                          tx.source === "loan"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {tx.source === "loan" ? "LOAN" : "DIARY"}
                      </Badge>
                      <div className="mt-1 text-[10px] text-muted-foreground font-mono">
                        {tx.source === "loan"
                          ? tx.loanAccountNumber
                          : tx.diaryAccountCode}
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-3 text-xs font-medium text-foreground capitalize">
                      {tx.type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right text-sm font-black text-foreground tabular-nums">
                      {formatCurrency(tx.amount)}
                      {tx.type === "deposit" || tx.source === "loan" ? (
                        <span className="text-success text-[10px] ml-1">
                          (IN)
                        </span>
                      ) : (
                        <span className="text-destructive text-[10px] ml-1">
                          (OUT)
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                      {tx.agentName || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() =>
                          window.open(
                            `/receipt/${tx.id}?source=${tx.source}`,
                            "_blank",
                          )
                        }
                        title="Print Receipt"
                      >
                        <Printer className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-sm text-muted-foreground"
                  >
                    No transactions found for this customer
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
