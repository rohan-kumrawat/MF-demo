import {
  type EmiStatus,
  getStatusColor,
  getStatusDotColor,
} from "../data/demoData";

interface StatusBadgeProps {
  status: EmiStatus;
  label: string;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  className = "",
}: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const dotClass = getStatusDotColor(status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${colorClass} ${className}`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass} shrink-0`} />
      {label}
    </span>
  );
}
