import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  gradient: string; // e.g. 'gradient-primary'
  trend?: string;
  subLabel?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  trend,
  subLabel,
}: StatCardProps) {
  const theme =
    gradient === "gradient-primary"
      ? {
          card: "border border-cyan-100/80 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-violet-500/10",
          glow: "bg-cyan-500/15",
          label: "text-cyan-700/80",
          value: "text-cyan-950",
          trend: "text-cyan-700",
        }
      : gradient === "gradient-secondary"
        ? {
            card: "border border-slate-200/80 bg-gradient-to-br from-slate-100 via-white to-slate-100",
            glow: "bg-slate-400/15",
            label: "text-slate-600",
            value: "text-slate-900",
            trend: "text-slate-600",
          }
        : gradient === "gradient-card-amber"
          ? {
              card: "border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-amber-500/10",
              glow: "bg-amber-500/15",
              label: "text-amber-700/80",
              value: "text-amber-950",
              trend: "text-amber-700",
            }
          : gradient === "gradient-card-red"
            ? {
                card: "border border-rose-200/80 bg-gradient-to-br from-rose-500/10 via-red-500/5 to-rose-500/10",
                glow: "bg-rose-500/15",
                label: "text-rose-700/80",
                value: "text-rose-950",
                trend: "text-rose-700",
              }
            : {
                card: "border border-primary/10 bg-card/90",
                glow: "bg-primary/5",
                label: "text-muted-foreground",
                value: "text-foreground",
                trend: "text-muted-foreground",
              };

  return (
    <div
      className={`backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 flex items-start gap-4 relative overflow-hidden group ${theme.card}`}
    >
      {/* Subtle background glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 group-hover:opacity-80 transition-colors pointer-events-none ${theme.glow}`}
      />

      <div className="flex-1 min-w-0 z-10">
        <p
          className={`text-[10px] font-bold uppercase tracking-[0.15em] mb-1.5 opacity-80 ${theme.label}`}
          style={{ fontFamily: "var(--font-sans)" }}
        >
          {label}
        </p>
        <p
          className={`text-2xl font-extrabold leading-tight ${theme.value}`}
          style={{ fontFamily: "Manrope, sans-serif" }}
        >
          {value}
        </p>
        {trend && (
          <p className="text-[11px] font-medium mt-2 flex items-center gap-1 text-muted-foreground">
            <span
              className={trend.includes("↑") ? "text-chart-1" : theme.trend}
            >
              {trend.split(" ")[0]}
            </span>
            {trend.split(" ").slice(1).join(" ")}
          </p>
        )}
        {subLabel && (
          <p className="text-[10px] text-muted-foreground mt-1 opacity-60 italic">
            {subLabel}
          </p>
        )}
      </div>

      <div
        className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shrink-0 shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300 z-10`}
      >
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}
