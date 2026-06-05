import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Download, X } from "lucide-react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { reportsService } from "../services/reportsService";
import { formatDisplayDate, formatCurrency } from "@/lib/utils";
import { format } from "date-fns";

const fmt = (v: number | string | undefined | null) =>
  formatCurrency(Number(v ?? 0));

export default function TransactionsDayPrintPage() {
  const { date } = useParams();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!date) {
      setError("Missing date");
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const pageSize = 200;
        let page = 1;
        let all: any[] = [];
        while (true) {
          const res = await reportsService.getCombinedTransactions({
            from: date,
            to: date,
            page,
            limit: pageSize,
          });
          all = all.concat(res.data);
          if (all.length >= (res.total || 0) || res.data.length < pageSize)
            break;
          page += 1;
        }
        setRows(all);
      } catch (e) {
        console.error(e);
        setError("Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [date]);

  const handleDownloadPDF = async () => {
    const filename = `transactions-${date}.pdf`;
    const el = document.getElementById("print-root");
    if (!el) return alert("Printable element not found");
    try {
      setDownloading(true);
      const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
      await pdf.html(el as HTMLElement, {
        x: 10,
        y: 10,
        html2canvas: { scale: 2, useCORS: true },
        callback: (doc) => {
          doc.save(filename);
        },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setDownloading(false);
    }
  };

  if (loading)
    return <div className="p-10 text-center">Loading transactions...</div>;
  if (error)
    return <div className="p-10 text-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-white text-black print:bg-white print:m-0 print:p-0">
      <style>{`@media print { @page { size: A4; margin: 10mm } .no-print, .no-print * { display: none !important } }`}</style>
      <div id="print-root" className="mx-auto max-w-6xl p-6">
        <div className="flex items-center justify-between mb-4 no-print">
          <div>
            <h1 className="text-xl font-bold">
              Transactions for {formatDisplayDate(date || "")}
            </h1>
            <p className="text-sm text-slate-600">
              Includes diary and loan transactions
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={handleDownloadPDF}
              disabled={downloading}
            >
              <Download className="w-4 h-4 mr-2" />{" "}
              {downloading ? "Preparing..." : "Download PDF"}
            </Button>
            <Button variant="ghost" onClick={() => window.close()}>
              <X className="w-4 h-4 mr-2" /> Close
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full text-sm">
                <TableHeader className="bg-slate-100">
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Performed By</TableHead>
                    <TableHead>Ref</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Principal</TableHead>
                    <TableHead className="text-right">Interest</TableHead>
                    <TableHead className="text-right">Penalty</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="odd:bg-white even:bg-slate-50/60"
                    >
                      <TableCell>
                        <div className="font-medium">
                          {tx.source === "loan" ? "Loan" : "Diary"}
                        </div>
                        <div className="text-xs text-slate-500">{tx.type}</div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {tx.customerName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {tx.agentName || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {tx.loanAccountNumber ||
                          tx.diaryAccountCode ||
                          tx.diaryId ||
                          "—"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {fmt(tx.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.principalPart != null ? fmt(tx.principalPart) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.interestPart != null ? fmt(tx.interestPart) : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {tx.penaltyPart != null ? fmt(tx.penaltyPart) : "—"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(tx.paymentDate), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{tx.paymentMode || "—"}</TableCell>
                      <TableCell className="max-w-[220px] truncate">
                        {tx.notes || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 text-xs text-slate-500">
          Generated {format(new Date(), "dd MMM yyyy, hh:mm a")}
        </div>
      </div>
    </div>
  );
}
