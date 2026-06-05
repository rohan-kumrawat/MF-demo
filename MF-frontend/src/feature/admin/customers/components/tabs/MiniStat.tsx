import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type Gradient = "navy" | "green" | "blue" | "amber" | "red" | "violet";

export const GRADIENTS: Record<Gradient, string> = {
  navy: "from-primary to-primary/80",
  green: "from-green-600 to-green-400",
  blue: "from-primary to-primary/70",
  amber: "from-amber-600 to-amber-400",
  red: "from-destructive to-destructive/80",
  violet: "from-primary to-primary/70",
};

export const GLOWS: Record<Gradient, string> = {
  navy: "#003366",
  green: "#4ac885",
  blue: "#3276e4",
  amber: "#fd822b",
  red: "#e54b4f",
  violet: "#7033ff",
};

interface MiniStatProps {
  label: string;
  value: string;
  color?: string;
  icon: LucideIcon;
  iconGradient?: Gradient;
  accentLeft?: boolean;
  className?: string;
}

export function MiniStat({
  label,
  value,
  color = "text-foreground",
  icon: Icon,
  iconGradient = "navy",
  accentLeft = false,
  className,
}: MiniStatProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-[14px] p-3.5 border border-border/50 relative overflow-hidden flex flex-col gap-2.5 shadow-xs transition-all hover:shadow-md",
        accentLeft && "border-l-[3px] border-l-amber-500/35 rounded-l-none",
        className,
      )}
    >
      <div
        className="absolute -top-3 -right-3 w-10 h-10 rounded-full pointer-events-none opacity-[0.08]"
        style={{ background: GLOWS[iconGradient] }}
      />
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.09em] text-muted-foreground">
          {label}
        </p>
        <div
          className={cn(
            "w-8 h-8 rounded-[9px] bg-linear-to-br flex items-center justify-center shrink-0 shadow-sm",
            GRADIENTS[iconGradient],
          )}
        >
          <Icon className="w-3.5 h-3.5 text-white" />
        </div>
      </div>
      <p
        className={cn(
          "text-[17px] font-extrabold leading-none tabular-nums",
          color,
        )}
        style={{ fontFamily: "Manrope, sans-serif" }}
      >
        {value}
      </p>
    </div>
  );
}
