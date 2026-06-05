// src/feature/admin/loans/components/CreateLoan/LoanSummaryPanel.tsx
import {
  type UseFormRegister,
  type FieldErrors,
  type Control,
} from "react-hook-form";
import { useCallback, useState } from "react";
import { useWatch } from "react-hook-form";
import { CheckCircle2, Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { inputCls, labelCls, type LoanFormData } from "./types";
import { LoanApplicationPrintView } from "./LoanApplicationPrintView";

interface Props {
  register: UseFormRegister<LoanFormData>;
  errors: FieldErrors<LoanFormData>;
  control: Control<LoanFormData>;
  isCreatingLoan: boolean;
  submitError: string | null;
  onCancel: () => void;
  submittedApplicationNo?: string | null;
  onDone?: () => void;
}

// Small read-only display row
function SummaryRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: "blue" | "green" | "amber";
}) {
  const colors = {
    blue: "text-[#005eb0]",
    green: "text-[#1a7a4a]",
    amber: "text-[#b45309]",
  };
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[#717784] font-medium">{label}</span>
      <span
        className={`font-bold ${highlight ? colors[highlight] : "text-[#121c28]"}`}
      >
        {value}
      </span>
    </div>
  );
}

function fmt(n: number) {
  return "₹" + (isNaN(n) ? "0" : n.toLocaleString("en-IN"));
}

export function LoanSummaryPanel({
  register,
  errors,
  control,
  isCreatingLoan,
  submitError,
  onCancel,
  submittedApplicationNo,
  onDone,
}: Props) {
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const loanType = useWatch({ control, name: "loanType" }) ?? "emi";
  const principal = useWatch({ control, name: "principalAmount" }) ?? 0;
  const interestRate = useWatch({ control, name: "interestRate" }) ?? 0;
  const tenureMonths = useWatch({ control, name: "tenureMonths" }) ?? 0;
  const emiAmount = useWatch({ control, name: "emiAmount" }) ?? 0;
  const fileCharge = useWatch({ control, name: "fileCharge" }) ?? 0;
  const otherCharge = useWatch({ control, name: "otherCharge" }) ?? 0;
  const totalPayable = useWatch({ control, name: "totalPayable" }) ?? 0;
  const dailyInstallment = useWatch({ control, name: "dailyInstallment" }) ?? 0;
  const totalDays = useWatch({ control, name: "totalDays" }) ?? 0;
  const weeklyInstallment =
    useWatch({ control, name: "weeklyInstallment" }) ?? 0;
  const totalWeeks = useWatch({ control, name: "totalWeeks" }) ?? 0;

  const totalCharges = fileCharge + otherCharge;
  const disbursed = principal - totalCharges; // actual cash given to borrower
  const totalInterest = totalPayable - principal;

  const isSubmitted = !!submittedApplicationNo;

  /**
   * Print handler: opens a SINGLE new window, writes the print document,
   * triggers print dialog, then closes the window after printing.
   * No pre-opened windows, no duplicate windows.
   */
  const handlePrintNow = useCallback(() => {
    const source = document.getElementById("loan-print-document");
    if (!source) return;

    const printableContent = source.innerHTML;
    const printWin = window.open("", "_blank", "width=900,height=1200");
    if (!printWin) return;

    printWin.document.open();
    printWin.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Loan Application — ${submittedApplicationNo ?? ""}</title>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            html, body {
              margin: 0;
              padding: 0;
              background: #fff;
              color: #000;
              font-family: Arial, sans-serif;
            }
            body {
              padding: 18px;
            }
            @page {
              size: A4;
              margin: 0.5in;
            }
          </style>
        </head>
        <body>
          <div style="max-width: 210mm; margin: 0 auto;">
            ${printableContent}
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();

    // Close window after printing (or if user cancels)
    printWin.addEventListener("afterprint", () => printWin.close(), {
      once: true,
    });

    // Slight delay to let the document render before triggering print
    window.setTimeout(() => {
      printWin.print();
    }, 400);
  }, [submittedApplicationNo]);

  // ── SUCCESS STATE — loan created, show loan number + print button ─────
  if (isSubmitted) {
    return (
      <div className="sticky top-6 flex flex-col gap-6">
        {/* Success card */}
        <div className="bg-white rounded-2xl border-2 border-[#1a7a4a]/30 shadow-lg overflow-hidden">
          <div className="bg-[#1a7a4a]/10 p-6 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-[#1a7a4a]/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-[#1a7a4a]" />
            </div>
            <h3 className="text-lg font-black text-[#1a7a4a] text-center">
              Loan Created Successfully!
            </h3>
            <p className="text-sm text-[#1a7a4a]/70 font-medium text-center">
              लोन सफलतापूर्वक बनाया गया
            </p>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Loan number display */}
            <div className="bg-[#f0f4ff] rounded-xl px-4 py-3 border border-[#005eb0]/20 text-center">
              <p className="text-xs font-bold text-[#717784] uppercase tracking-wider mb-1">
                Loan Account Number
              </p>
              <p className="text-xl font-black text-[#005eb0] tracking-wide">
                {submittedApplicationNo}
              </p>
            </div>

            <SummaryRow label="Principal" value={fmt(principal)} />
            <SummaryRow
              label="Total Payable"
              value={fmt(totalPayable)}
              highlight="blue"
            />
            <SummaryRow
              label="Disbursed"
              value={fmt(disbursed)}
              highlight="green"
            />
          </div>
        </div>

        {/* Print preview (hidden but rendered for content extraction) */}
        <div className="hidden">
          <LoanApplicationPrintView
            control={control}
            applicationNo={submittedApplicationNo}
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            onClick={() => setIsPrintPreviewOpen(true)}
            className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 gradient-primary text-white"
          >
            <Printer className="size-4" />
            Preview & Print Application
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onDone}
            className="w-full py-3.5 text-sm font-bold"
          >
            Done — Go to Loans
          </Button>
        </div>

        {/* Print preview sheet */}
        <Sheet open={isPrintPreviewOpen} onOpenChange={setIsPrintPreviewOpen}>
          <SheetContent
            side="right"
            className="w-[96vw]! max-w-none! bg-[#f3f5f9] p-0 overflow-y-auto"
            showCloseButton={false}
          >
            <div className="flex h-full flex-col">
              <SheetHeader className="border-b border-black/10 bg-white px-5 py-4">
                <SheetTitle className="text-lg font-black text-[#121c28]">
                  Print Preview — {submittedApplicationNo}
                </SheetTitle>
                <SheetDescription className="text-sm text-[#717784]">
                  Review the loan application before printing. Loan number is
                  included.
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-auto p-4 lg:p-6">
                <div className="mx-auto w-full max-w-[210mm] rounded-lg bg-white shadow-xl">
                  <LoanApplicationPrintView
                    control={control}
                    applicationNo={submittedApplicationNo}
                  />
                </div>
              </div>

              <SheetFooter className="border-t border-black/10 bg-white px-5 py-4">
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPrintPreviewOpen(false)}
                  >
                    Close Preview
                  </Button>
                  <Button
                    type="button"
                    onClick={handlePrintNow}
                    className="gradient-primary text-white"
                  >
                    <Printer className="size-4 mr-2" />
                    Print Now
                  </Button>
                </div>
              </SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  // ── FORM STATE — loan not yet created ─────────────────────────────────
  return (
    <div className="sticky top-6 flex flex-col gap-6">
      {/* ── Charges inputs (always visible) ─────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-5 flex flex-col gap-4">
        <h3 className="text-base font-black text-[#121c28]">Charges</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>File Charge (₹)</label>
            <Input
              type="number"
              step="0.01"
              {...register("fileCharge", { valueAsNumber: true })}
              placeholder="0"
              className={inputCls()}
            />
          </div>
          <div>
            <label className={labelCls}>Other Charges (₹)</label>
            <Input
              type="number"
              step="0.01"
              {...register("otherCharge", { valueAsNumber: true })}
              placeholder="0"
              className={inputCls()}
            />
          </div>
        </div>
      </div>

      {/* ── Loan Summary Card ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#005eb0]/20 shadow-ambient overflow-hidden">
        <div className="bg-[#005eb0]/5 p-5 border-b border-[#005eb0]/10">
          <h3 className="text-lg font-black text-[#121c28]">Loan Summary</h3>
        </div>

        <div className="p-5 flex flex-col gap-3">
          {/* ── Common rows (all loan types) ── */}
          <SummaryRow label="Principal Amount" value={fmt(principal)} />
          <SummaryRow
            label="Interest Rate"
            value={interestRate ? `${interestRate}% p.a.` : "—"}
          />
          <SummaryRow
            label="Processing Charges"
            value={fmt(totalCharges)}
            highlight="amber"
          />

          {/* Disbursed Amount — key field */}
          <div className="flex justify-between items-center text-sm bg-[#f0fff8] rounded-lg px-3 py-2 border border-[#1a7a4a]/20">
            <span className="text-[#1a7a4a] font-bold">Disbursed Amount</span>
            <span className="text-[#1a7a4a] font-black text-base">
              {fmt(disbursed)}
            </span>
          </div>

          <Separator />

          {/* ── EMI-specific rows ── */}
          {loanType === "emi" && (
            <>
              <SummaryRow
                label="Tenure"
                value={tenureMonths ? `${tenureMonths} months` : "—"}
              />
              <SummaryRow
                label="Monthly EMI"
                value={fmt(emiAmount)}
                highlight="blue"
              />
              <SummaryRow label="Total Interest" value={fmt(totalInterest)} />
            </>
          )}

          {/* ── Bullet-specific rows ── */}
          {loanType === "bullet" && (
            <>
              <SummaryRow
                label="Tenure"
                value={tenureMonths ? `${tenureMonths} months` : "—"}
              />
              <SummaryRow
                label="Bullet Amount"
                value={fmt(emiAmount)}
                highlight="blue"
              />
              <SummaryRow label="Total Interest" value={fmt(totalInterest)} />
            </>
          )}

          {/* ── Flexible-specific rows ── */}
          {(loanType === "flexible" || loanType === "weekly") && (
            <>
              {loanType === "flexible" ? (
                <>
                  <SummaryRow
                    label="Daily Installment"
                    value={fmt(dailyInstallment)}
                    highlight="blue"
                  />
                  <SummaryRow
                    label="Total Days"
                    value={totalDays ? `${totalDays} days` : "—"}
                  />
                </>
              ) : (
                <>
                  <SummaryRow
                    label="Per Week Amount"
                    value={fmt(weeklyInstallment)}
                    highlight="blue"
                  />
                  <SummaryRow
                    label="Total Weeks"
                    value={totalWeeks ? `${totalWeeks} weeks` : "—"}
                  />
                </>
              )}
            </>
          )}

          <Separator />

          {/* Total Payable — auto-calculated, read-only display + hidden field */}
          <div className="flex justify-between items-center bg-[#f0f4ff] rounded-xl px-4 py-3 border border-[#005eb0]/20">
            <span className="text-[#121c28] font-black">Total Payable</span>
            <span className="text-xl font-black text-[#005eb0]">
              {fmt(totalPayable)}
            </span>
          </div>

          {/* Hidden registered field so RHF/Zod still validates it */}
          <input
            type="hidden"
            {...register("totalPayable", { valueAsNumber: true })}
          />
          {errors.totalPayable && (
            <p className="text-[10px] text-[#ba1a1a]">
              {errors.totalPayable.message}
            </p>
          )}
        </div>
      </div>

      {/* ── Notes ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-5">
        <label className={labelCls}>Admin Notes (Internal)</label>
        <Textarea
          rows={3}
          {...register("notes")}
          placeholder="Enter any office remarks or declarations..."
          className="resize-none bg-[#f8f9ff] border-[#c3c6d1]/30 focus:border-[#005eb0] focus:ring-1 focus:ring-[#005eb0]/20"
        />
      </div>

      {/* ── Error ───────────────────────────────────────────────────────── */}
      {submitError && (
        <Alert variant="destructive">
          <AlertDescription className="font-bold text-center">
            {submitError}
          </AlertDescription>
        </Alert>
      )}

      {/* ── Actions ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPrintPreviewOpen(true)}
          className="w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
        >
          <Printer className="size-4" />
          Print Preview
        </Button>
        <Button
          type="submit"
          disabled={isCreatingLoan}
          className="w-full py-3.5 gradient-primary rounded-xl text-sm font-black text-white hover:opacity-90 disabled:opacity-50 transition-all shadow-md"
        >
          {isCreatingLoan && (
            <Loader2 className="size-5 animate-spin" data-icon="inline-start" />
          )}
          {isCreatingLoan ? "Processing Application..." : "Submit Application"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="w-full py-3.5 text-sm font-bold"
        >
          Cancel Draft
        </Button>
      </div>

      {/* Print preview sheet (before submission — no loan number) */}
      <Sheet open={isPrintPreviewOpen} onOpenChange={setIsPrintPreviewOpen}>
        <SheetContent
          side="right"
          className="w-[96vw]! max-w-none! bg-[#f3f5f9] p-0 overflow-y-auto"
          showCloseButton={false}
        >
          <div className="flex h-full flex-col">
            <SheetHeader className="border-b border-black/10 bg-white px-5 py-4">
              <SheetTitle className="text-lg font-black text-[#121c28]">
                Print Preview
              </SheetTitle>
              <SheetDescription className="text-sm text-[#717784]">
                Review the loan application. Loan number will be added after
                submission.
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-auto p-4 lg:p-6">
              <div className="mx-auto w-full max-w-[210mm] rounded-lg bg-white shadow-xl">
                <LoanApplicationPrintView control={control} />
              </div>
            </div>

            <SheetFooter className="border-t border-black/10 bg-white px-5 py-4">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPrintPreviewOpen(false)}
                >
                  Close Preview
                </Button>
              </div>
            </SheetFooter>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
