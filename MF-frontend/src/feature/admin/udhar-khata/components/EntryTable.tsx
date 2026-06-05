import React from "react";
import { Trash2 } from "lucide-react";
import type { UdharDisplayEntry } from "../types";
import { formatRupee } from "../../../../data/demoData";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface Props {
  entries: UdharDisplayEntry[];
  onEditEntry: (entry: UdharDisplayEntry) => void;
  onDeleteEntry: (entryId: string) => void;
  deletingId?: string | null;
}

export const EntryTable = React.memo(function EntryTable({
  entries,
  onEditEntry,
  onDeleteEntry,
  deletingId,
}: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/50">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-[10px] font-bold uppercase tracking-wider">
              Date
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider hidden sm:table-cell">
              Due Date
            </TableHead>
            <TableHead className="text-right text-[10px] font-bold text-green-600 uppercase tracking-wider">
              Liye (IN)
            </TableHead>
            <TableHead className="text-right text-[10px] font-bold text-destructive uppercase tracking-wider">
              Diye (OUT)
            </TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
              Interest
            </TableHead>
            <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider">
              Balance
            </TableHead>
            <TableHead className="text-[10px] font-bold uppercase tracking-wider hidden sm:table-cell">
              Remark
            </TableHead>
            <TableHead className="w-20" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="h-24 text-center text-xs text-muted-foreground"
              >
                Abhi koi entry nahi hai
              </TableCell>
            </TableRow>
          ) : (
            entries.map((e) => (
              <tr
                key={e.id}
                className="group transition-colors border-b hover:bg-muted/30"
              >
                <TableCell className="text-xs text-muted-foreground">
                  {e.date}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                  {e.dueDate ? e.dueDate : "—"}
                </TableCell>
                <TableCell className="text-xs font-semibold text-green-600 text-right">
                  {e.liye ? formatRupee(e.liye) : "—"}
                </TableCell>
                <TableCell className="text-xs font-semibold text-destructive text-right">
                  {e.diye ? formatRupee(e.diye) : "—"}
                </TableCell>
                <TableCell className="text-xs font-semibold text-right">
                  {e.interestAmount ? formatRupee(e.interestAmount) : "—"}
                </TableCell>
                <TableCell
                  className={cn(
                    "text-sm font-bold text-right",
                    e.balance >= 0 ? "text-green-600" : "text-destructive",
                  )}
                >
                  {e.balance >= 0 ? "+" : ""}
                  {formatRupee(e.balance)}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">
                  {e.remark}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEditEntry(e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity size-8 text-primary"
                      aria-label="Edit entry"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDeleteEntry(e.id)}
                      disabled={!!deletingId}
                      className={cn(
                        "size-8 text-destructive",
                        deletingId === e.id
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100",
                      )}
                      aria-label="Delete entry"
                    >
                      {deletingId === e.id ? (
                        <Spinner className="size-3" />
                      ) : (
                        <Trash2 className="size-3" />
                      )}
                    </Button>
                  </div>
                </TableCell>
              </tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
});
