// src/feature/admin/udhar-khata/pages/UdharKhataPage.tsx
import { useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import { useUdharKhata } from "../hooks/useUdharKhata";
import { SearchBar } from "../components/SearchBar";
import { AddKhatedarModal } from "../components/AddKhatedarModal";
import { UdharKhataSummaryCards } from "../components/UdharKhataSummaryCards";
import { formatRupee } from "../../../../data/demoData";
import type { CreateUdharPersonDto } from "../types";
import { usePageShortcuts } from "@/hooks/useKeyboardShortcuts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function UdharKhataPage() {
  const {
    filteredKhatedars,
    summary,
    isSummaryLoading,
    searchQuery,
    setSearchQuery,
    addKhatedar,
    isLoading,
    isAddingPerson,
  } = useUdharKhata();

  const navigate = useNavigate();
  const location = useLocation();
  const prefix = location.pathname.startsWith("/kiosk") ? "/kiosk" : "/admin";

  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  usePageShortcuts("udhar-khata", [
    {
      key: "n",
      altKey: true,
      description: "Add new khatedar",
      action: () => setAddPersonOpen(true),
    },
    {
      key: "/",
      description: "Focus search",
      action: () => searchRef.current?.focus(),
    },
  ]);

  const handleAddKhatedar = useCallback(
    async (dto: CreateUdharPersonDto) => {
      await addKhatedar(dto);
      setAddPersonOpen(false);
    },
    [addKhatedar],
  );

  return (
    <div className="p-4 lg:p-6 flex flex-col gap-6 animate-fade-in max-w-full w-full">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-black text-foreground tracking-tight leading-tight">
            Udhar Khata <span className="text-muted-foreground/40 mx-1">—</span>{" "}
            <span className="font-medium text-muted-foreground">उधार खाता</span>
          </h1>
          <p className="text-xs text-muted-foreground font-medium">
            Informal credit ledger / अनौपचारिक उधार बही
          </p>
        </div>

        <Button
          onClick={() => setAddPersonOpen(true)}
          className="rounded-xl h-11 px-6 font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all gap-2"
        >
          <Plus className="size-4" /> Naya Khatedar Joden
        </Button>
      </div>

      <div className="max-w-xl">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          inputRef={searchRef}
          isLoading={isLoading}
        />
      </div>

      <UdharKhataSummaryCards summary={summary} isLoading={isSummaryLoading} />

      {/* Khatedar list */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner className="size-8 text-primary" />
          <p className="text-sm text-muted-foreground font-medium">
            Data load ho raha hai...
          </p>
        </div>
      ) : filteredKhatedars.length === 0 ? (
        <Card className="border-border/50 bg-card/50">
          <div className="text-center py-20 px-6">
            <p className="text-base font-bold text-foreground">
              {searchQuery
                ? "Koi khatedar nahi mila"
                : "Abhi koi khatedar nahi hai"}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery
                ? "Search term badal kar dekhein."
                : "Naya khatedar jodkar shuru karein."}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="border-border/50 shadow-sm overflow-hidden p-0">
          <Table>
            <TableHeader className="bg-muted">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="px-5 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Naam
                </TableHead>
                <TableHead className="px-5 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:table-cell">
                  Phone
                </TableHead>
                <TableHead className="px-5 h-12 text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden lg:table-cell">
                  Address
                </TableHead>
                <TableHead className="px-5 h-12 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Net Balance
                </TableHead>
                <TableHead className="px-5 h-12 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="w-12 h-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKhatedars.map((k) => {
                const balance = parseFloat(k.netBalance);
                const positive = balance >= 0;
                return (
                  <TableRow
                    key={k.id}
                    onClick={() => navigate(`${prefix}/udhar-khata/${k.id}`)}
                    className="cursor-pointer hover:bg-muted/30 border-border/40 transition-colors group"
                  >
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "size-10 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 shadow-sm transition-transform group-hover:scale-105",
                            positive ? "bg-green-600" : "bg-destructive",
                          )}
                        >
                          {k.name[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-bold text-foreground tracking-tight">
                            {k.name}
                          </span>
                          {k.personCode && (
                            <span className="text-[10px] font-mono font-medium text-muted-foreground w-fit">
                              {k.personCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs font-medium text-muted-foreground hidden sm:table-cell">
                      {k.phone || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-xs font-medium text-muted-foreground hidden lg:table-cell max-w-[150px] truncate">
                      {k.address || "—"}
                    </TableCell>
                    <TableCell className="px-5 py-4 text-right">
                      <span
                        className={cn(
                          "text-sm font-black tabular-nums tracking-tight",
                          positive ? "text-green-600" : "text-destructive",
                        )}
                      >
                        {positive ? "+" : ""}
                        {formatRupee(balance)}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      {k.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-4 py-4 text-right">
                      <ChevronRight className="size-4 text-muted-foreground/30 transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <AddKhatedarModal
        open={addPersonOpen}
        onSave={handleAddKhatedar}
        onClose={() => setAddPersonOpen(false)}
        isPending={isAddingPerson}
      />
    </div>
  );
}
