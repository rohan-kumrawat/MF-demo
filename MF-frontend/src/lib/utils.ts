import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined | null) {
  const value = typeof amount === "string" ? parseFloat(amount) : (amount ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDisplayDate(date: string | Date | null | undefined) {
  if (!date) return "—";

  const parsed = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();

  return `${day}/${month}/${year}`;
}

export const CenterName = [
  { id: "7e8667c6-d555-4d20-b9b4-241065ef4750", name: "Sant Siyaram" },
  { id: "1c34dc23-daf4-4b6d-8254-d4a232430721", name: "Guru Kripa" },
];

/**
 * Returns today's date as a local yyyy-MM-dd string.
 * Avoids the UTC offset bug with toISOString().split('T')[0].
 */
export function localToday(): string {
  return localDateStr(new Date());
}

/**
 * Formats any Date to local yyyy-MM-dd string.
 */
export function localDateStr(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
