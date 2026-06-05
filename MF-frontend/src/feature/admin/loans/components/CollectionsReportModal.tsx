// src/feature/admin/loans/components/CollectionsReportModal.tsx
import { useState } from "react";
import {
  X,
  BarChart3,
  Loader2,
  TrendingUp,
  Receipt,
  Calendar,
} from "lucide-react";
import { useAgents } from "@/feature/admin/customers/hooks/useAgents";
import { useCollectionReport } from "../hooks/useLoans";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { localToday, localDateStr } from "@/lib/utils";

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);

interface Props {
  open: boolean;
  onClose: () => void;
}

export function CollectionsReportModal({ open, onClose }: Props) {
  const firstOfMonth = (() => {
    const d = new Date();
    d.setDate(1);
    return localDateStr(d);
  })();

  const [from, setFrom] = useState(firstOfMonth);
  const [to, setTo] = useState(localToday());
  const [agentId, setAgentId] = useState("");

  const { data: agents = [] } = useAgents();

  const {
    data: report,
    isLoading,
    isFetching,
    refetch,
  } = useCollectionReport({ from, to, agentId: agentId || undefined }, false);

  const handleGenerate = () => {
    refetch();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#121c28]/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-2xl shadow-ambient-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="shrink-0 px-6 py-4 border-b border-[#c1c6d5]/20 bg-[#f8f9ff] rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed]">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3
                className="text-base font-extrabold text-[#121c28]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Collections Report
              </h3>
              <p className="text-[11px] text-[#717784] font-bold">
                Generate collection data for a date range
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#f0f2f5] rounded-xl transition-colors"
          >
            <X className="w-5 h-5 text-[#43474f]" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Filter bar */}
          <div className="bg-[#f8f9ff] rounded-xl p-4 space-y-3">
            <p className="text-[10px] font-extrabold text-[#717784] uppercase tracking-widest">
              Report Filters
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-bold text-[#43474f] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#005eb0]" /> From Date
                </label>
                <DatePickerField
                  value={from}
                  onChange={(value) => setFrom(value ?? "")}
                  buttonClassName="w-full px-4 py-2.5 bg-white border border-[#c3c6d1]/30 rounded-xl text-sm focus:outline-none focus:border-[#7c3aed] transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#43474f] mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#005eb0]" /> To Date
                </label>
                <DatePickerField
                  value={to}
                  onChange={(value) => setTo(value ?? "")}
                  buttonClassName="w-full px-4 py-2.5 bg-white border border-[#c3c6d1]/30 rounded-xl text-sm focus:outline-none focus:border-[#7c3aed] transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#43474f] mb-1.5 block">
                  Agent
                </label>
                <select
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#c3c6d1]/30 rounded-xl text-sm focus:outline-none focus:border-[#7c3aed] transition-all"
                >
                  <option value="">All Agents</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={isLoading || isFetching}
              className="w-full py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading || isFetching ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4" /> Generate Report
                </>
              )}
            </button>
          </div>

          {/* Loading */}
          {(isLoading || isFetching) && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#7c3aed]" />
              <p className="text-xs font-bold text-[#717784]">
                Generating report...
              </p>
            </div>
          )}

          {/* Placeholder — no report yet */}
          {!report && !isLoading && !isFetching && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <BarChart3 className="w-12 h-12 text-[#c1c6d5]" />
              <p className="text-sm font-bold text-[#43474f]">No data yet</p>
              <p className="text-xs text-[#717784] text-center max-w-xs">
                Set your filters above and click "Generate Report" to view
                collection data.
              </p>
            </div>
          )}

          {/* Results */}
          {report && !isFetching && (
            <div className="space-y-4">
              {/* Summary cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-xl border border-[#c1c6d5]/20 shadow-ambient p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#1a8a58]/10 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4 text-[#1a8a58]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#717784] uppercase tracking-wider">
                      Total Collected
                    </p>
                    <p className="text-sm font-black text-[#121c28] tabular-nums">
                      {fmt(report.totalCollected)}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#c1c6d5]/20 shadow-ambient p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#005eb0]/10 flex items-center justify-center shrink-0">
                    <Receipt className="w-4 h-4 text-[#005eb0]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#717784] uppercase tracking-wider">
                      Transactions
                    </p>
                    <p className="text-sm font-black text-[#121c28] tabular-nums">
                      {report.totalTransactions}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-[#c1c6d5]/20 shadow-ambient p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#7c3aed]/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#7c3aed]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[#717784] uppercase tracking-wider">
                      Period
                    </p>
                    <p className="text-[11px] font-bold text-[#121c28]">
                      {report.period.from} → {report.period.to}
                    </p>
                  </div>
                </div>
              </div>

              {/* By-agent breakdown */}
              <div className="bg-white rounded-xl border border-[#c1c6d5]/20 overflow-hidden">
                <div className="px-4 py-3 bg-[#f8f9ff] border-b border-[#c1c6d5]/15">
                  <p className="text-[10px] font-extrabold text-[#717784] uppercase tracking-widest">
                    Agent Breakdown
                  </p>
                </div>

                {report.byAgent.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-sm font-bold text-[#43474f]">
                      No agent data for the selected period.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-[#f8f9ff]">
                          {[
                            "Agent",
                            "Collected",
                            "EMIs",
                            "Penalties",
                            "Other",
                          ].map((h) => (
                            <th
                              key={h}
                              className="px-4 py-3 text-[10px] font-extrabold text-[#43474f] uppercase tracking-wider"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#c1c6d5]/10">
                        {report.byAgent.map((row) => {
                          const agentName =
                            row.agentName ??
                            agents.find((a) => a.id === row.agentId)?.name ??
                            row.agentId.slice(-6).toUpperCase();
                          const initial = agentName[0].toUpperCase();
                          return (
                            <tr
                              key={row.agentId}
                              className="hover:bg-[#f8f9ff]"
                            >
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-lg bg-[#7c3aed] flex items-center justify-center text-white text-xs font-black shrink-0">
                                    {initial}
                                  </div>
                                  <span className="text-sm font-bold text-[#121c28]">
                                    {agentName}
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm font-bold text-[#1a8a58] tabular-nums">
                                {fmt(row.totalAmount)}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-[#43474f] tabular-nums">
                                {row.emiCount}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-[#ba1a1a] tabular-nums">
                                {row.penaltyCount}
                              </td>
                              <td className="px-4 py-3 text-xs font-bold text-[#43474f] tabular-nums">
                                {row.otherCount}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="shrink-0 px-6 py-4 border-t border-[#c1c6d5]/20 bg-[#f8f9ff] rounded-b-2xl flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 border border-[#c3c6d1] rounded-xl text-sm font-bold text-[#43474f] hover:bg-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
