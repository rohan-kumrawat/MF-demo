// src/pages/agent/AgentDashboard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useAgentDashboard } from "../../feature/agent/hooks/useAgentDashboard";
import {
  Wallet,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
  IndianRupee,
  BookOpen,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDisplayDate, localToday } from "../../lib/utils";

const AgentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    stats,
    pendingEmis,
    trends,
    diarySummary,
    combinedVolume,
    isLoading,
  } = useAgentDashboard(user?.id || "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const chartData =
    trends?.dayWise?.map((d) => ({
      date: formatDisplayDate(d.date),
      amount: d.totalAmount,
    })) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Hi, {user?.name?.split(" ")[0] || "Agent"}! 👋
          </h2>
          <p className="text-sm text-gray-500 font-medium">
            Here's what's happening with your collections.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
          <Clock size={16} className="text-primary" />
          <span className="text-xs font-bold text-gray-600">
            {formatDisplayDate(new Date())}
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Loan Collection"
          value={`₹${(trends?.dayWise?.find((d) => d.date === localToday())?.totalAmount || 0).toLocaleString("en-IN")}`}
          sub={`Centre Total: ₹${stats.collectedToday.toLocaleString("en-IN")}`}
          icon={<IndianRupee size={20} />}
          color="blue"
        />
        <StatCard
          label="Today's Diary Collection"
          value={`₹${(diarySummary?.perAgentToday?.find((a) => a.agentId === user?.id)?.amount || 0).toLocaleString("en-IN")}`}
          sub={`Centre Total: ₹${(diarySummary?.todaysCollection || 0).toLocaleString("en-IN")}`}
          icon={<BookOpen size={20} />}
          color="purple"
        />
        <StatCard
          label="Overdue Loans"
          value={String(stats.pendingCount)}
          sub="Action required"
          icon={<AlertCircle size={20} />}
          color="orange"
        />
        <StatCard
          label="30-Day Total Collection"
          value={`₹${(combinedVolume?.totalAmount || 0).toLocaleString("en-IN")}`}
          sub={`${combinedVolume?.total || 0} Transactions`}
          icon={<TrendingUp size={20} />}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Trend */}
        <div className="lg:col-span-2 bg-white rounded-4xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-gray-900 tracking-tight">
              Performance Trend
            </h3>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              Last 30 Days
            </span>
          </div>
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#005eb0" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#005eb0" stopOpacity={0} />
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
                  tick={{ fontSize: 10, fontWeight: 600, fill: "#9ca3af" }}
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
        </div>

        {/* Quick Actions & Pending List */}
        <div className="space-y-6">
          <div
            className="bg-primary rounded-4xl p-5 sm:p-6 shadow-lg shadow-primary/20 flex items-center justify-between gap-2 text-white group cursor-pointer"
            onClick={() => navigate("/agent/collect")}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm sm:text-base truncate">
                  Record Payment
                </h3>
                <p className="text-[10px] sm:text-xs text-white/70 font-medium truncate">
                  Start collection flow
                </p>
              </div>
            </div>
            <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center text-primary group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>

          <div className="bg-white rounded-4xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-black text-gray-900 tracking-tight mb-4">
              Upcoming EMIs
            </h3>
            <div className="space-y-4">
              {pendingEmis.slice(0, 4).map((emi) => (
                <div
                  key={emi.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        emi.status === "high-risk"
                          ? "bg-red-500"
                          : emi.status === "overdue"
                            ? "bg-orange-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">
                        {emi.customerName}
                      </p>
                      <p className="text-[10px] font-bold text-gray-400">
                        {emi.daysLabel}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-gray-900">
                    ₹{emi.amount.toLocaleString("en-IN")}
                  </p>
                </div>
              ))}
              {pendingEmis.length === 0 && (
                <p className="text-center text-xs text-gray-400 py-4 font-bold">
                  All clear for now!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "orange" | "purple";
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  sub,
  icon,
  color,
}) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className="bg-white p-5 rounded-4xl shadow-sm border border-gray-100">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border ${colors[color]}`}
      >
        {icon}
      </div>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <h4 className="text-lg font-black text-gray-900 mb-1">{value}</h4>
      <p className="text-[10px] font-bold text-gray-500">{sub}</p>
    </div>
  );
};

export default AgentDashboard;
