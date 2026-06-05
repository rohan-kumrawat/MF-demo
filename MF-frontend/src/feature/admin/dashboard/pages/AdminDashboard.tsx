import React, { useState } from "react";
import {
  Wallet,
  CreditCard,
  TrendingDown,
  AlertTriangle,
  Loader2,
  Trophy,
  TrendingUp,
  Receipt,
  Users,
  Calendar,
  User,
  Filter,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useLoansDashboard } from "@/feature/admin/loans";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { jsPDF } from "jspdf";
import { reportsService } from "@/feature/admin/reports/services/reportsService";
import { formatDisplayDate, localToday } from "@/lib/utils";

import { useAgents } from "@/feature/admin/agents/hooks/useAgents";
import { useAuthStore } from "@/store/authStore";
import { useCollectionReport, useAgentReport } from "../hooks/useDashboard";

const getDateRangeForPeriod = (period: string) => {
  const today = new Date();
  const fromDate = new Date();

  if (period === "week") {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    fromDate.setDate(diff);
  } else if (period === "month") {
    fromDate.setDate(1);
  }

  const formatDate = (date: Date) => {
    const d = new Date(date);
    let month = "" + (d.getMonth() + 1);
    let day = "" + d.getDate();
    const year = d.getFullYear();
    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    return [year, month, day].join("-");
  };

  return { from: formatDate(fromDate), to: formatDate(today) };
};

const formatRupee = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const formatPdfAmount = (amount: number | string | null | undefined) => {
  const value = Number(amount ?? 0);
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(value);
};

function SummaryStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
}) {
  const colors: Record<
    string,
    { card: string; glow: string; icon: string; label: string; value: string }
  > = {
    blue: {
      card: "border border-cyan-100/80 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-violet-500/10",
      glow: "bg-cyan-500/15",
      icon: "text-cyan-700",
      label: "text-cyan-700/80",
      value: "text-cyan-950",
    },
    green: {
      card: "border border-emerald-100/80 bg-gradient-to-br from-emerald-500/10 via-green-500/5 to-teal-500/10",
      glow: "bg-emerald-500/15",
      icon: "text-emerald-700",
      label: "text-emerald-700/80",
      value: "text-emerald-950",
    },
    purple: {
      card: "border border-violet-100/80 bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10",
      glow: "bg-violet-500/15",
      icon: "text-violet-700",
      label: "text-violet-700/80",
      value: "text-violet-950",
    },
    orange: {
      card: "border border-amber-100/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10",
      glow: "bg-amber-500/15",
      icon: "text-amber-700",
      label: "text-amber-700/80",
      value: "text-amber-950",
    },
  };

  return (
    <Card
      className={`border-none shadow-md rounded-3xl overflow-hidden bg-card/90 backdrop-blur-sm ${colors[color].card}`}
    >
      <CardContent className="p-5 flex items-center gap-4">
        <div
          className={`relative w-12 h-12 rounded-2xl flex items-center justify-center border ${colors[color].glow} shadow-sm`}
        >
          <span
            className={`absolute inset-0 rounded-2xl blur-xl opacity-70 ${colors[color].glow}`}
          />
          <span className={`relative z-10 ${colors[color].icon}`}>{icon}</span>
        </div>
        <div>
          <p
            className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${colors[color].label}`}
          >
            {label}
          </p>
          <p
            className={`text-lg font-black tracking-tight ${colors[color].value}`}
          >
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data: stats, isLoading: isLoansLoading } = useLoansDashboard();

  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [period, setPeriod] = useState("month");
  const [selectedDate, setSelectedDate] = useState<string>(localToday());
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const { agents } = useAgents();
  const dateRange = React.useMemo(
    () => getDateRangeForPeriod(period),
    [period],
  );
  const { data: summary, isLoading: isSummaryLoading } =
    useCollectionReport(dateRange);
  const { data: agentReport, isLoading: isReportLoading } = useAgentReport(
    selectedAgentId,
    30,
  );

  const chartData =
    agentReport?.dayWise?.map((d: any) => ({
      date: formatDisplayDate(d.date),
      amount: d.totalAmount,
      transactions: d.txCount,
    })) || [];

  const downloadTransactionsPdf = async () => {
    if (!selectedDate) return alert("Please select a date");

    setDownloadingPdf(true);
    try {
      const pageSize = 200;
      let page = 1;
      let all: any[] = [];

      while (true) {
        const res = await reportsService.getCombinedTransactions({
          from: selectedDate,
          to: selectedDate,
          page,
          limit: pageSize,
        });
        all = all.concat(res.data);
        if (all.length >= (res.total || 0) || res.data.length < pageSize) {
          break;
        }
        page += 1;
      }

      const doc = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const lineGap = 4;
      const topMargin = 5; // extra top spacing requested
      const titleY = margin + topMargin + 4; // place title a bit below top margin
      const tableTop = titleY + 14; // keep table below title with spacing
      const usableWidth = pageWidth - margin * 2;

      const colWidth = (usableWidth - margin) / 2;
      const columns = [
        { key: "customer", label: "Customer", width: 28 },
        { key: "ref", label: "Ref", width: 20 },
        { key: "amount", label: "Amount", width: 22 },
        { key: "notes", label: "Notes", width: colWidth - (28 + 20 + 22) },
      ];

      const diaryTxs = all.filter((tx) => tx.source === "diary");
      const loanTxs = all.filter((tx) => tx.source === "loan");

      const centreId = useAuthStore.getState().user?.centreId;

      const getCenterName = (centerId?: string | null) => {
        const DEFAULT_CENTER_NAME =
          "SANT SIYARAM SAH SAKHA SASTHA MARYADIT BHOINDA";
        if (centerId === "1c34dc23-daf4-4b6d-8254-d4a232430721") {
          return "GURU KRIPA SAH SAKHA SASTHA MARYADIT DHARAMRAY";
        }
        return DEFAULT_CENTER_NAME;
      };

      const centreName = getCenterName(centreId);

      const drawHeader = () => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        // centre name centered at the top
        doc.text(centreName, pageWidth / 2, titleY - 6, { align: "center" });

        doc.setFontSize(14);
        doc.text(`Transactions for ${selectedDate}`, margin, titleY + 6);
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        // Section headings above table: left = Diary, right = Loan
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const headingHeight = 9;
        const leftX = margin;
        const leftW = colWidth;
        const leftCenter = leftX + leftW / 2;
        const headingY = tableTop - headingHeight - 4; // position heading above the column headers
        doc.setFillColor(245, 245, 245);
        doc.rect(leftX, headingY, leftW, headingHeight, "FD");
        doc.setTextColor(40, 40, 40);
        doc.text(
          "Diary Transactions",
          leftCenter,
          headingY + headingHeight / 2 + 2,
          { align: "center" },
        );

        const rightX = margin + colWidth;
        const rightW = colWidth;
        const rightCenter = rightX + rightW / 2;
        doc.setFillColor(245, 245, 245);
        doc.rect(rightX, headingY, rightW, headingHeight, "FD");
        doc.text(
          "Loan Transactions",
          rightCenter,
          headingY + headingHeight / 2 + 2,
          { align: "center" },
        );

        // restore font for column labels
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);

        // Left side header (Diary)
        let x = margin;
        doc.setFillColor(235, 244, 239);
        doc.setDrawColor(210, 215, 222);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.rect(margin, tableTop - 5, colWidth, 7, "FD");
        x = margin;
        for (const col of columns) {
          doc.text(col.label, x + 1, tableTop);
          x += col.width;
        }

        // Right side header (Loan)
        doc.setFillColor(244, 239, 235);
        doc.rect(margin + colWidth, tableTop - 5, colWidth, 7, "FD");
        x = margin + colWidth;
        for (const col of columns) {
          doc.text(col.label, x + 1, tableTop);
          x += col.width;
        }
      };

      const formatCell = (value: unknown) => {
        if (value === null || value === undefined || value === "") return "-";
        return String(value);
      };

      const rowHeightFor = (row: any, colList: typeof columns) => {
        const values = [
          row.customerName,
          row.loanAccountNumber || row.diaryAccountCode || row.diaryId,
          formatPdfAmount(row.amount),
          row.notes,
        ];

        return Math.max(
          ...values.map((value, index) => {
            const text = formatCell(value);
            const split = doc.splitTextToSize(text, colList[index].width - 2);
            return split.length * lineGap;
          }),
          6,
        );
      };

      const isDebit = (tx: any) => {
        const t = (tx?.type || "").toString().toLowerCase();
        return (
          t.includes("withdraw") ||
          t === "disbursal" ||
          t === "debit" ||
          t.includes("disbur")
        );
      };

      const appendNetRow = (
        netValue: number,
        startX: number,
        currentY: number,
      ) => {
        const fake = {
          customerName: "Net",
          diaryAccountCode: "",
          loanAccountNumber: "",
          amount: Math.abs(netValue),
          notes: "",
        };
        const rowH = rowHeightFor(fake, columns) + 2;
        if (currentY + rowH > pageHeight - margin) {
          doc.addPage();
          drawHeader();
          currentY = tableTop + 6;
        }

        let x = startX;
        const sign = netValue >= 0 ? "+" : "-";
        const netStr = sign + formatPdfAmount(Math.abs(netValue));
        const cellValues = ["Net", "", netStr, ""];
        doc.setFont("helvetica", "bold");
        for (let i = 0; i < columns.length; i += 1) {
          const col = columns[i];
          const text = formatCell(cellValues[i]);
          const wrapped = doc.splitTextToSize(text, col.width - 2);
          doc.rect(x, currentY - 4, col.width, rowH);
          doc.text(wrapped, x + 1, currentY);
          x += col.width;
        }
        doc.setFont("helvetica", "normal");
        return currentY + rowH;
      };

      const renderRowsForSource = (
        txs: any[],
        startX: number,
        startY: number,
      ) => {
        let y = startY;
        for (const row of txs) {
          const rowHeight = rowHeightFor(row, columns) + 2;
          if (y + rowHeight > pageHeight - margin) {
            return y;
          }

          let x = startX;
          const amtSign = isDebit(row) ? "-" : "+";
          const cellValues = [
            row.customerName,
            row.loanAccountNumber || row.diaryAccountCode || row.diaryId,
            amtSign + formatPdfAmount(Math.abs(row.amount || 0)),
            row.notes,
          ];

          for (let i = 0; i < columns.length; i += 1) {
            const col = columns[i];
            const text = formatCell(cellValues[i]);
            const wrapped = doc.splitTextToSize(text, col.width - 2);
            doc.rect(x, y - 4, col.width, rowHeight);
            doc.text(wrapped, x + 1, y);
            x += col.width;
          }

          y += rowHeight;
        }
        return y;
      };

      const y = tableTop + 6;
      drawHeader();

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);

      // Render both columns and append net rows
      let diaryY = renderRowsForSource(diaryTxs, margin, y);
      const diaryNet = diaryTxs.reduce(
        (s, tx) =>
          s + (isDebit(tx) ? -Number(tx.amount || 0) : Number(tx.amount || 0)),
        0,
      );
      diaryY = appendNetRow(diaryNet, margin, diaryY);

      let loanY = renderRowsForSource(loanTxs, margin + colWidth, tableTop + 6);
      const loanNet = loanTxs.reduce(
        (s, tx) =>
          s + (isDebit(tx) ? -Number(tx.amount || 0) : Number(tx.amount || 0)),
        0,
      );
      loanY = appendNetRow(loanNet, margin + colWidth, loanY);

      doc.save(`transactions-${selectedDate}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF");
    } finally {
      setDownloadingPdf(false);
    }
  };

  if (isLoansLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#005eb0]" />
        <p className="text-xs font-bold text-[#717784] uppercase tracking-widest">
          Loading Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in w-full pb-20 bg-gradient-to-b from-background via-background to-muted/20">
      {/* Top Level KPIs (Loans) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Collection"
          value={formatRupee(stats?.collectedToday ?? 0).toString()}
          icon={Wallet}
          gradient="gradient-primary"
          trend="Real-time update"
        />
        <StatCard
          label="Total Loans"
          value={(stats?.totalLoans ?? 0).toString()}
          icon={CreditCard}
          gradient="gradient-secondary"
          trend={`${stats?.activeLoans ?? 0} active`}
        />
        <StatCard
          label="Outstanding"
          value={formatRupee(stats?.totalOutstanding ?? 0).toString()}
          icon={TrendingDown}
          gradient="gradient-card-amber"
          trend="Total principal + int"
        />
        <StatCard
          label="Overdue"
          value={(stats?.overdueLoans ?? 0).toString()}
          icon={AlertTriangle}
          gradient="gradient-card-red"
          trend={formatRupee(stats?.totalOverdueAmount ?? 0).toString()}
        />
      </div>

      <hr className="border-indigo-200/60 my-4" />

      {/* Agents Collections Analysis Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm px-4 py-4 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Collections Analysis
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Detailed performance metrics across all field agents
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[140px] bg-card border-2 border-indigo-200 shadow-sm rounded-xl font-bold text-xs h-10 hover:border-indigo-300">
              <Calendar className="size-3.5 mr-2 text-indigo-600" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent
              className="rounded-xl border border-indigo-100 shadow-xl"
              position="popper"
              align="start"
            >
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-3 flex items-center gap-2">
            <input
              type="date"
              className="border border-slate-200 rounded-md px-2 py-1 text-sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Button
              size="sm"
              onClick={downloadTransactionsPdf}
              disabled={downloadingPdf}
            >
              {downloadingPdf ? "Preparing..." : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>

      {/* Centre Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryStat
          label="Grand Total"
          value={`₹${(summary?.totalCollected || 0).toLocaleString("en-IN")}`}
          icon={<TrendingUp size={20} />}
          color="blue"
        />
        <SummaryStat
          label="Total Transactions"
          value={String(summary?.totalTransactions || 0)}
          icon={<Receipt size={20} />}
          color="green"
        />
        <SummaryStat
          label="Active Agents"
          value={String(agents.length)}
          icon={<Users size={20} />}
          color="purple"
        />
        <SummaryStat
          label="Average/Agent"
          value={`₹${Math.round((summary?.totalCollected || 0) / (agents.length || 1)).toLocaleString("en-IN")}`}
          icon={<TrendingUp size={20} />}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Leaderboard */}
        <Card className="lg:col-span-1 border-none shadow-md bg-card/90 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-indigo-50 bg-gradient-to-r from-indigo-500/5 via-transparent to-teal-500/5 flex items-center justify-between">
            <h3 className="font-black text-foreground tracking-tight flex items-center gap-2">
              <Trophy className="size-4 text-amber-500" />
              Leaderboard
            </h3>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-black border-indigo-100 bg-indigo-50 text-indigo-600"
            >
              {period}
            </Badge>
          </div>
          <CardContent className="p-0">
            {isSummaryLoading ? (
              <div className="p-10 flex justify-center bg-gradient-to-b from-indigo-50/40 to-transparent">
                <Spinner />
              </div>
            ) : (
              <div className="divide-y divide-indigo-50">
                {[...(summary?.byAgent || [])]
                  .sort(
                    (a: any, b: any) =>
                      (b.totalAmount || 0) - (a.totalAmount || 0),
                  )
                  .map((item: any, index: number) => {
                    const agentName = item.agentName || "Unknown Agent";
                    return (
                      <div
                        key={item.agentId}
                        className="p-4 hover:bg-indigo-50/50 transition-colors flex items-center justify-between group"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-6 text-xs font-black ${index < 3 ? "text-primary" : "text-slate-300"}`}
                          >
                            #{index + 1}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-foreground">
                              {agentName}
                            </p>
                            <p className="text-[10px] font-medium text-slate-500">
                              {(item.emiCount || 0) +
                                (item.penaltyCount || 0) +
                                (item.otherCount || 0)}{" "}
                              transactions
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-foreground">
                            ₹{(item.totalAmount || 0).toLocaleString("en-IN")}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-black text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50"
                            onClick={() => setSelectedAgentId(item.agentId)}
                          >
                            View Trend
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Detailed Trend */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-md bg-card/90 rounded-3xl overflow-hidden">
            <div className="p-6 border-b border-teal-50 bg-gradient-to-r from-teal-500/5 via-transparent to-indigo-500/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-black text-foreground tracking-tight">
                  Agent Performance Trend
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">
                  Daily breakdown for last 30 days
                </p>
              </div>
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
              >
                <SelectTrigger className="w-full sm:w-[200px] bg-card border-2 border-teal-200 rounded-xl font-bold text-xs hover:border-teal-300">
                  <User className="size-3.5 mr-2 text-teal-600" />
                  <SelectValue placeholder="Select Agent" />
                </SelectTrigger>
                <SelectContent
                  className="rounded-xl border border-teal-100 shadow-xl"
                  position="popper"
                  align="start"
                >
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <CardContent className="p-6">
              {!selectedAgentId ? (
                <div className="h-[300px] flex flex-col items-center justify-center text-slate-300 gap-4 bg-gradient-to-b from-teal-50/40 to-transparent rounded-2xl">
                  <Filter size={48} strokeWidth={1} />
                  <p className="text-sm font-bold">
                    Select an agent to view detailed trend
                  </p>
                </div>
              ) : isReportLoading ? (
                <div className="h-[300px] flex items-center justify-center">
                  <Spinner />
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="h-[240px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="colorAmount"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#005eb0"
                              stopOpacity={0.1}
                            />
                            <stop
                              offset="95%"
                              stopColor="#005eb0"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          vertical={false}
                          stroke="#f0f0f0"
                        />
                        <XAxis
                          dataKey="date"
                          axisLine={false}
                          tickLine={false}
                          tick={{
                            fontSize: 10,
                            fontWeight: 600,
                            fill: "#9ca3af",
                          }}
                          minTickGap={30}
                        />
                        <YAxis hide />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "16px",
                            border: "none",
                            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="amount"
                          stroke="#005eb0"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorAmount)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 p-4 rounded-2xl border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-600/70 uppercase tracking-widest mb-1">
                        Agent Total
                      </p>
                      <p className="text-xl font-black text-foreground">
                        ₹{agentReport?.grandTotal.toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-gradient-to-br from-teal-500/10 to-teal-600/5 p-4 rounded-2xl border border-teal-100">
                      <p className="text-[10px] font-black text-teal-600/70 uppercase tracking-widest mb-1">
                        Avg. Transaction
                      </p>
                      <p className="text-xl font-black text-foreground">
                        ₹
                        {Math.round(
                          agentReport?.grandTotal /
                            (agentReport?.totalTransactions || 1),
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
