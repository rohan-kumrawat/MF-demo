// src/feature/admin/daily-register/components/UpiSelect.tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const UPI_OPTIONS = [
  { value: "PHONE_PAY", label: "PhonePe" },
  { value: "GOOGLE_PAY", label: "Google Pay" },
  { value: "PAYTM", label: "Paytm" },
  { value: "BHIM_UPI", label: "BHIM UPI" },
  { value: "OTHER", label: "Other UPI" },
  { value: "BUSINESS_QR", label: "Business QR" },
] as const;

import { type UpiOption } from "@/types/daily-register.types";

interface UpiSelectProps {
  value?: UpiOption;
  onChange: (v: UpiOption | undefined) => void;
  placeholder?: string;
  className?: string;
}

export function UpiSelect({
  value,
  onChange,
  placeholder = "UPI...",
  className = "",
}: UpiSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as UpiOption)}>
      <SelectTrigger
        className={`h-full w-full text-xs border-transparent hover:border-slate-300 focus:border-[#005eb0] focus:ring-1 focus:ring-[#005eb0]/20 shadow-none bg-transparent ${className}`}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" align="start">
        {UPI_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value} className="text-xs">
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
