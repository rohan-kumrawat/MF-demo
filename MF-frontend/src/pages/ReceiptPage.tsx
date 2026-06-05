import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { reportsService } from "@/feature/admin/reports/services/reportsService";
import { IndianRupee } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function ReceiptPage() {
  const { txId } = useParams();
  const [searchParams] = useSearchParams();
  const source = searchParams.get("source") as "loan" | "diary";

  const [receiptData, setReceiptData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!txId || !source) {
      setError("Invalid receipt parameters.");
      setLoading(false);
      return;
    }

    const fetchReceipt = async () => {
      try {
        const data = await reportsService.getTransactionReceipt(txId, source);
        setReceiptData(data);
        // Automatically trigger print dialog once data is loaded and rendered
        setTimeout(() => {
          window.print();
        }, 500);
      } catch (err) {
        setError("Failed to load receipt details.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [txId, source]);

  if (loading)
    return (
      <div className="p-10 text-center font-medium">Loading Receipt...</div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500 font-bold">{error}</div>
    );
  if (!receiptData) return null;

  const isLoan = source === "loan";
  const {
    customerName,
    customerCode,
    customerPhone,
    customerAddress,
    agentName,
    paymentDate,
    amount,
    type,
    receiptNo,
    notes,
    remainingBalance,
    // Loan specifics
    loanAccountNumber,
    principalPart,
    interestPart,
    penaltyPart,
    // Diary specifics
    diaryAccountCode,
    centreId,
  } = receiptData;

  const getHeading = (cId: string) => {
    if (cId === "7e8667c6-d555-4d20-b9b4-241065ef4750") {
      return "SANT SIYARAM SAH SAKHA SASTHA MARYADIT BHOINDA";
    }
    if (cId === "1c34dc23-daf4-4b6d-8254-d4a232430721") {
      return "GURU KRIPA SAH SAKHA SASTHA MARYADIT DHARAMRAY";
    }
    return "SANT SIYARAM SAH SAKHA SASTHA MARYADIT BHOINDA";
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "emi":
        return "EMI Payment";
      case "full_payment":
        return "Full Payment";
      case "penalty":
        return "Penalty Payment";
      case "deposit":
        return "Deposit";
      case "withdraw":
        return "Withdrawal";
      case "interest":
        return "Interest Credited";
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div
      id="receipt-container"
      className="bg-white min-h-screen text-black font-sans print:bg-white print:m-0 print:p-0"
    >
      {/* Hide everything else on print, show only this container */}
      <style>{`
        @media print {
          @page { margin: 0; size: auto; }
          body { margin: 1cm; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          #receipt-container, #receipt-container * {
            visibility: visible !important;
          }
          .no-print, .no-print * { display: none !important; }
        }
      `}</style>

      <div className="max-w-3xl mx-auto p-8 border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Header Section */}
        <div className="text-center border-b-2 border-black pb-6 mb-6">
          <h1 className="text-lg sm:text-xl font-bold uppercase tracking-widest text-gray-900 leading-tight">
            {getHeading(centreId)}
          </h1>
          <h2 className="text-base sm:text-lg mt-3 tracking-widest text-gray-600 uppercase font-semibold">
            Transaction Receipt
          </h2>
          <div className="flex justify-between items-end mt-6 text-sm">
            <div className="text-left font-medium text-gray-700">
              <p>
                Receipt No:{" "}
                <span className="font-bold text-black">
                  {receiptNo || `REC-${txId?.slice(0, 8).toUpperCase()}`}
                </span>
              </p>
              <p>
                Date:{" "}
                <span className="font-bold text-black">
                  {format(new Date(paymentDate), "dd MMM yyyy, hh:mm a")}
                </span>
              </p>
            </div>
            <div className="text-right font-medium text-gray-700">
              <p>
                Type:{" "}
                <span className="font-bold text-black">
                  {isLoan ? "Loan" : "Diary / Savings"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Customer Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">
              Customer Details
            </h3>
            <div className="space-y-1 text-sm text-gray-800">
              <p className="flex justify-between">
                <span>Name:</span>{" "}
                <span className="font-bold">{customerName}</span>
              </p>
              <p className="flex justify-between">
                <span>Code:</span>{" "}
                <span className="font-bold">{customerCode || "N/A"}</span>
              </p>
              <p className="flex justify-between">
                <span>Phone:</span>{" "}
                <span className="font-bold">{customerPhone || "N/A"}</span>
              </p>
              {customerAddress && (
                <p className="flex justify-between">
                  <span>Address:</span>{" "}
                  <span className="font-medium text-right max-w-[60%]">
                    {customerAddress}
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* Account Details */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3 border-b pb-1">
              Account Details
            </h3>
            <div className="space-y-1 text-sm text-gray-800">
              <p className="flex justify-between">
                <span>{isLoan ? "Loan ID:" : "Diary ID:"}</span>
                <span className="font-bold">
                  {isLoan ? loanAccountNumber : diaryAccountCode}
                </span>
              </p>
              <p className="flex justify-between">
                <span>
                  {isLoan ? "Outstanding Balance:" : "Total Balance:"}
                </span>
                <span className="font-bold flex items-center">
                  <IndianRupee className="w-3 h-3 mr-0.5" />
                  {formatCurrency(remainingBalance).replace("₹", "").trim()}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Transaction Summary Box */}
        <div className="bg-gray-50 border border-gray-300 rounded-lg p-6 mb-8 print:bg-gray-100 print:border-gray-400">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-4 text-center">
            Transaction Summary
          </h3>

          <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
            <span className="text-lg font-semibold text-gray-700">
              {getTransactionLabel(type)}
            </span>
            <span className="text-3xl font-bold flex items-center text-black">
              {type === "withdraw" ? "-" : "+"}{" "}
              <IndianRupee className="w-6 h-6 ml-1 mr-1" />
              {formatCurrency(amount).replace("₹", "").trim()}
            </span>
          </div>

          {/* Loan Breakdowns if applicable */}
          {isLoan &&
            (principalPart > 0 || interestPart > 0 || penaltyPart > 0) && (
              <div className="grid grid-cols-3 gap-4 text-center text-sm mt-4">
                {principalPart > 0 && (
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold">
                      Principal
                    </p>
                    <p className="font-semibold mt-1">₹ {principalPart}</p>
                  </div>
                )}
                {interestPart > 0 && (
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold">
                      Interest
                    </p>
                    <p className="font-semibold mt-1">₹ {interestPart}</p>
                  </div>
                )}
                {penaltyPart > 0 && (
                  <div>
                    <p className="text-gray-500 uppercase text-xs font-bold">
                      Penalty
                    </p>
                    <p className="font-semibold mt-1">₹ {penaltyPart}</p>
                  </div>
                )}
              </div>
            )}

          {notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
              <span className="font-bold mr-2">Notes:</span> {notes}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 flex justify-between items-end border-t-2 border-black pt-6">
          <div className="text-sm">
            <p className="font-bold text-gray-800">Processed By:</p>
            <p className="text-gray-600 uppercase tracking-wide mt-1">
              {agentName}
            </p>
          </div>
          <div className="text-center text-xs text-gray-400 uppercase tracking-widest">
            Generated by System
          </div>
        </div>

        {/* Actions (Hidden on print) */}
        <div className="mt-12 text-center no-print">
          <button
            onClick={() => window.print()}
            className="px-8 py-3 bg-primary text-primary-foreground font-bold rounded shadow-lg hover:opacity-90 transition uppercase tracking-widest"
          >
            Print / Save as PDF
          </button>
          <button
            onClick={() => window.close()}
            className="ml-4 px-8 py-3 bg-gray-200 text-gray-800 font-bold rounded shadow hover:bg-gray-300 transition uppercase tracking-widest"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
