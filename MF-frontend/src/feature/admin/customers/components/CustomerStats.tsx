import React from "react";
import { Users, ActivitySquare, AlertCircle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Customer } from "../types";

interface Props {
  customers: Customer[];
  serverTotal: number;
}

const StatCard = ({
  label,
  value,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: {
  label: string;
  value: string | number;
  icon: any;
  trend?: string;
  trendValue?: string;
  variant?: "default" | "primary" | "destructive";
}) => {
  const variants = {
    default: {
      iconBg: "bg-primary/10 text-primary",
      chartColor: "text-primary/20",
      accent: "bg-primary",
    },
    primary: {
      iconBg: "bg-blue-500/10 text-blue-600",
      chartColor: "text-blue-500/20",
      accent: "bg-blue-500",
    },
    destructive: {
      iconBg: "bg-destructive/10 text-destructive",
      chartColor: "text-destructive/20",
      accent: "bg-destructive",
    },
  };

  const v = variants[variant];

  return (
    <Card className="group relative overflow-hidden border-none bg-card/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all duration-500 p-6">
      {/* Background Accent Decoration */}
      <div
        className={cn(
          "absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-[0.03] blur-3xl transition-all duration-500 group-hover:opacity-[0.08] group-hover:scale-110",
          v.accent,
        )}
      />
      <div
        className={cn(
          "absolute bottom-0 left-0 w-2 h-0 group-hover:h-full transition-all duration-500",
          v.accent,
        )}
      />

      <div className="flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
              v.iconBg,
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          {trendValue && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/10 text-green-600 text-[10px] font-black tracking-tight">
              <TrendingUp className="w-3 h-3" />
              {trendValue}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-muted-foreground/60 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black tabular-nums tracking-tighter text-foreground">
              {value.toLocaleString()}
            </h3>
            {trend && (
              <span className="text-[10px] font-bold text-muted-foreground/50">
                {trend}
              </span>
            )}
          </div>
        </div>

        {/* Mock Sparkline (Visual Flourish) */}
        <div className="mt-2 flex items-end gap-1 h-8 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
          {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
            <div
              key={i}
              className={cn(
                "w-full rounded-t-sm transition-all duration-500 group-hover:scale-y-110",
                v.accent,
              )}
              style={{ height: `${h}%`, opacity: (i + 1) / 8 }}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};

export const CustomerStats = React.memo(function CustomerStats({
  customers,
  serverTotal,
}: Props) {
  const totalCustomers = serverTotal;
  const activeCount = customers.filter(
    (c) => c.emiStatus === "active" || c.emiStatus === "green" || !c.emiStatus,
  ).length;
  const defaulterCount = customers.filter(
    (c) => c.emiStatus === "defaulter" || c.emiStatus === "red",
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      <StatCard
        label="Total Customers"
        value={totalCustomers}
        icon={Users}
        trend="overall"
        trendValue="+12%"
        variant="default"
      />
      <StatCard
        label="Active Accounts"
        value={activeCount}
        icon={ActivitySquare}
        trend="currently"
        trendValue="+5.2%"
        variant="primary"
      />
      <StatCard
        label="Defaulters"
        value={defaulterCount}
        icon={AlertCircle}
        trend="requires attention"
        variant="destructive"
      />
    </div>
  );
});
