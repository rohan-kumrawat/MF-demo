// src/feature/admin/daily-register/components/CellInput.tsx

interface CellInputProps {
  value?: string | number;
  onChange: (v: any) => void;
  placeholder?: string;
  type?: "number" | "text" | "time";
  className?: string;
}

export function CellInput({
  value,
  onChange,
  placeholder,
  type = "number",
  className = "",
}: CellInputProps) {
  const displayValue =
    type === "number" && Number.isNaN(value as number) ? "" : (value ?? "");

  return (
    <input
      type={type}
      value={displayValue}
      onChange={(e) => {
        if (type === "number") {
          const val =
            e.target.value === "" ? undefined : Number(e.target.value);
          onChange(val);
        } else {
          onChange(e.target.value);
        }
      }}
      placeholder={placeholder}
      className={`w-full bg-transparent outline-none border border-transparent hover:border-slate-300 focus:border-[#005eb0] focus:bg-white focus:ring-1 focus:ring-[#005eb0]/20 rounded px-2 py-1.5 transition-all text-xs font-medium ${
        type === "number" ? "text-right" : "text-left"
      } placeholder:text-slate-300 placeholder:font-normal ${className}`}
    />
  );
}
