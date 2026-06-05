// src/feature/admin/udhar-khata/components/SearchBar.tsx
import React from "react";
import { Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  value: string;
  onChange: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  isLoading?: boolean;
}

export const SearchBar = React.memo(function SearchBar({
  value,
  onChange,
  inputRef,
  isLoading,
}: Props) {
  return (
    <InputGroup className="bg-muted/30 border-border/50 h-11 rounded-xl shadow-sm">
      <InputGroupAddon align="inline-start">
        {isLoading ? (
          <Spinner className="size-4 text-primary" />
        ) : (
          <Search className="size-4 text-muted-foreground pointer-events-none" />
        )}
      </InputGroupAddon>
      <InputGroupInput
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Naam ya phone se search karein..."
        className="text-sm font-medium"
      />
    </InputGroup>
  );
});
