import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import { useDayEntries, useDayRegisters } from "../hooks/useDailyRegister";
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
import { formatDisplayDate, formatCurrency } from "@/lib/utils";

const money = (value: number | string | undefined | null) =>
  formatCurrency(Number(value ?? 0));

function timeLabel(isoString?: string) {
  if (!isoString) return "—";
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DailyRegisterPrintPage() {
  const { dayId } = useParams();
  const printStartedRef = useRef(false);
  const { data: days = [], isLoading: isDaysLoading } = useDayRegisters();
  const { data: entries = [], isLoading: isEntriesLoading } = useDayEntries(
    dayId ?? "",
  );

  const day = useMemo(
    () => days.find((item) => item.id === dayId) ?? null,
    [days, dayId],
  );

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.totalIn +=
          Number(entry.deposit || 0) +
          Number(entry.payIn || 0) +
          Number(entry.addAmount || 0) +
          Number(entry.recharge || 0) +
          Number(entry.commission || 0);
        acc.totalOut += Number(entry.withdraw || 0) + Number(entry.payOut || 0);
        acc.income += Number(entry.commission || 0);
        return acc;
      },
      { totalIn: 0, totalOut: 0, income: 0 },
    );
  }, [entries]);

  const isLoading = isDaysLoading || isEntriesLoading;
  const error = !dayId
    ? "Missing register day id."
    : !isLoading && !day
      ? "Register day not found."
      : "";

  useEffect(() => {
    if (!day || isLoading || printStartedRef.current || error) return;

    printStartedRef.current = true;

    const afterPrint = () => window.close();
    const timer = window.setTimeout(() => window.print(), 500);

    window.addEventListener("afterprint", afterPrint);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", afterPrint);
    };
  }, [day, error, isLoading]);

  if (isLoading) {
    return (
      <div className="p-10 text-center font-medium">
        Loading daily register...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-red-600 font-bold">{error}</div>
    );
  }

  if (!day) return null;

  const netMovement = totals.totalIn - totals.totalOut;

  return (
    <div
      id="daily-register-print-container"
      className="min-h-screen bg-white text-black print:bg-white print:m-0 print:p-0"
    >
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body { margin: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #daily-register-print-container, #daily-register-print-container * {
            visibility: visible !important;
          }
          .no-print, .no-print * { display: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px] p-4 print:p-0">
        <div className="flex items-center justify-between gap-4 mb-6 no-print">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500">
              Print Preview
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Daily Register Printout
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              Print Now
            </Button>
            <Button variant="ghost" onClick={() => window.close()}>
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
          </div>
        </div>

        <Card className="border-slate-200 shadow-none rounded-none print:border-none">
          <CardContent className="p-0">
            <div className="border-b-2 border-black px-6 py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.35em] text-slate-500">
                    Daily Register
                  </p>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 mt-1">
                    {formatDisplayDate(day.entryDate)}
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Entries recorded for {day.entryDate}
                  </p>
                </div>
                <div className="text-right text-sm text-slate-600">
                  <p>
                    Opening Balance:{" "}
                    <span className="font-bold text-slate-900">
                      {money(day.openingBalance)}
                    </span>
                  </p>
                  <p>
                    Closing Balance:{" "}
                    <span className="font-bold text-slate-900">
                      {money(day.closingBalance)}
                    </span>
                  </p>
                  <p>
                    Entries:{" "}
                    <span className="font-bold text-slate-900">
                      {entries.length}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 p-6 lg:grid-cols-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Opening Balance
                </p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  {money(day.openingBalance)}
                </p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                  Total In
                </p>
                <p className="mt-2 text-lg font-black text-emerald-700">
                  {money(totals.totalIn)}
                </p>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
                  Total Out
                </p>
                <p className="mt-2 text-lg font-black text-rose-700">
                  {money(totals.totalOut)}
                </p>
              </div>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">
                  Net Movement
                </p>
                <p className="mt-2 text-lg font-black text-amber-700">
                  {money(netMovement)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Closing Balance
                </p>
                <p className="mt-2 text-lg font-black text-slate-900">
                  {money(day.closingBalance)}
                </p>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Table className="w-full text-sm">
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead className="w-[90px]">Time</TableHead>
                      <TableHead>UPI</TableHead>
                      <TableHead className="text-right">Add</TableHead>
                      <TableHead className="text-right">Pay In</TableHead>
                      <TableHead className="text-right">Pay Out</TableHead>
                      <TableHead className="text-right">Withdraw</TableHead>
                      <TableHead className="text-right">Recharge</TableHead>
                      <TableHead className="text-right">Comm.</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="py-10 text-center text-slate-500"
                        >
                          No entries recorded for this day.
                        </TableCell>
                      </TableRow>
                    ) : (
                      entries.map((entry, index) => (
                        <TableRow
                          key={entry.id}
                          className={
                            index % 2 === 0 ? "bg-white" : "bg-slate-50/60"
                          }
                        >
                          <TableCell className="font-mono text-xs text-slate-700">
                            {timeLabel(entry.entryTime)}
                          </TableCell>
                          <TableCell className="font-semibold text-slate-700">
                            {entry.upi ?? "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-700">
                            {Number(entry.addAmount || 0) > 0
                              ? money(entry.addAmount)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-blue-700">
                            {Number(entry.payIn || 0) > 0
                              ? money(entry.payIn)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-orange-700">
                            {Number(entry.payOut || 0) > 0
                              ? money(entry.payOut)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-red-700">
                            {Number(entry.withdraw || 0) > 0
                              ? money(entry.withdraw)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-violet-700">
                            {Number(entry.recharge || 0) > 0
                              ? money(entry.recharge)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-amber-700">
                            {Number(entry.commission || 0) > 0
                              ? money(entry.commission)
                              : "—"}
                          </TableCell>
                          <TableCell className="max-w-[260px] whitespace-normal text-slate-700">
                            {entry.remark || "—"}
                          </TableCell>
                          <TableCell className="text-right font-black text-slate-900">
                            {money(entry.balanceAfter)}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex items-end justify-between px-2 text-xs text-slate-500">
          <p>Generated on {format(new Date(), "dd MMM yyyy, hh:mm a")}</p>
          <p className="font-semibold uppercase tracking-[0.25em]">
            Daily Register System
          </p>
        </div>
      </div>
    </div>
  );
}
