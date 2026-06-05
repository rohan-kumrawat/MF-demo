// src/features/admin/diary/components/CustomerSearchCombobox.tsx
import { useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePersonSearch } from "../hooks/useDiary";

interface Props {
  value: string; // selected customerId
  onChange: (id: string, name: string) => void;
  disabled?: boolean;
  displayName?: string; // shown in trigger when editing
  error?: boolean;
}

export function CustomerSearchCombobox({
  value,
  onChange,
  disabled = false,
  displayName = "",
  error = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Hook already debounces internally — just pass raw input
  const { data: results = [], isLoading } = usePersonSearch(searchQuery);

  // Label shown in the trigger button
  const triggerLabel = value
    ? displayName ||
      results.find((c) => c.id === value)?.name ||
      "Customer selected"
    : "Search customer...";

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "h-12 w-full justify-between rounded-xl bg-muted/40 border-muted-foreground/20 font-normal",
            !value && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive",
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0 rounded-xl"
        align="start"
      >
        <Command
          shouldFilter={false} // ← critical: server handles filtering
        >
          <CommandInput
            placeholder="Type name to search..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            {isLoading && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isLoading && searchQuery.trim() && results.length === 0 && (
              <CommandEmpty>
                No customers found for "{searchQuery}"
              </CommandEmpty>
            )}

            {!isLoading && !searchQuery.trim() && (
              <CommandEmpty className="py-4 text-xs">
                Start typing to search customers
              </CommandEmpty>
            )}

            {!isLoading && results.length > 0 && (
              <CommandGroup>
                {results.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      onChange(customer.id, customer.name);
                      setSearchQuery(""); // clear search after selection
                      setOpen(false);
                    }}
                  >
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="font-semibold truncate">
                        {customer.name}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {customer.customerCode || "N/A"}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "ml-auto h-4 w-4 shrink-0",
                        value === customer.id ? "opacity-100" : "opacity-0",
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
