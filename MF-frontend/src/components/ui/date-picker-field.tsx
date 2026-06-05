import { format, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerFieldProps {
  value?: string;
  onChange: (value?: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
  align?: "start" | "center" | "end";
}

function displayDate(value?: string) {
  if (!value) return "";
  try {
    return format(parseISO(value), "dd/MM/yyyy");
  } catch {
    return value;
  }
}

function toDate(value?: string) {
  if (!value) return undefined;
  try {
    return parseISO(value);
  } catch {
    return undefined;
  }
}

export function DatePickerField({
  value,
  onChange,
  placeholder = "DD/MM/YYYY",
  className,
  buttonClassName,
  disabled,
  align = "start",
}: DatePickerFieldProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            buttonClassName,
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
          <span className={cn(!value && "text-muted-foreground", className)}>
            {value ? displayDate(value) : placeholder}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="single"
          selected={toDate(value)}
          onSelect={(date) =>
            onChange(date ? format(date, "yyyy-MM-dd") : undefined)
          }
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
