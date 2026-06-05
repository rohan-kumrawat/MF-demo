import React, { useCallback, useState, useMemo } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { formatRupee } from "../../../../data/demoData";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { EntryTable } from "./EntryTable";
import type { UdharDisplayEntry, UdharPerson } from "../types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePersonEntries } from "../hooks/useUdharKhata";

interface Props {
  khatedar: UdharPerson;
  onAddEntry: (p: UdharPerson) => void;
  onDeleteKhatedar: (id: string) => void;
  onDeleteEntry: (personId: string, entryId: string) => void;
  isDeletingPerson?: boolean;
  isDeletingEntry?: boolean;
}

const AVATAR_COLOR_POS = "#006c49";
const AVATAR_COLOR_NEG = "#ba1a1a";

export const KhatedarCard = React.memo(function KhatedarCard({
  khatedar,
  onAddEntry,
  onDeleteKhatedar,
  onDeleteEntry,
  isDeletingPerson,
  isDeletingEntry,
}: Props) {
  const [pendingDeleteEntryId, setPendingDeleteEntryId] = useState<
    string | null
  >(null);
  const [khatedarDeleteOpen, setKhatedarDeleteOpen] = useState(false);

  // Fetch real entries for this person
  const { data: rawEntries = [], isLoading } = usePersonEntries(khatedar.id);

  // Map and sort entries for EntryTable
  // API structure: { type: 'debit' | 'credit', amount, entryDate, description }
  // UI expectation: { date, liye, diye, balance, remark }
  const entries = useMemo(() => {
    const sorted = [...rawEntries].sort(
      (a, b) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    );

    const { result } = sorted.reduce(
      (acc, e) => {
        const val = Number(e.amount) || 0;
        const interest = Number(e.interestAmount) || 0;
        const totalVal = val + interest;

        const liye = e.entryType === "liya" ? val : null;
        const diye = e.entryType === "diya" ? val : null;
        const newBalance =
          acc.running + (e.entryType === "liya" ? totalVal : -totalVal);

        acc.result.push({
          id: e.id,
          date: e.entryDate,
          liye,
          diye,
          interestAmount:
            e.interestAmount != null ? Number(e.interestAmount) : null,
          dueDate: e.dueDate || null,
          balance: newBalance,
          remark: e.remark,
        });

        acc.running = newBalance;
        return acc;
      },
      { result: [] as UdharDisplayEntry[], running: 0 },
    );

    return result.reverse();
  }, [rawEntries]);

  const balance = parseFloat(khatedar.netBalance);
  const positive = balance >= 0;

  const handleAddEntry = useCallback(
    () => onAddEntry(khatedar),
    [onAddEntry, khatedar],
  );

  const handleEntryDeleteRequest = useCallback((entryId: string) => {
    setPendingDeleteEntryId(entryId);
  }, []);

  const handleEntryDeleteConfirm = useCallback(() => {
    if (pendingDeleteEntryId) {
      onDeleteEntry(khatedar.id, pendingDeleteEntryId);
      setPendingDeleteEntryId(null);
    }
  }, [pendingDeleteEntryId, khatedar.id, onDeleteEntry]);

  const handleKhatedarDeleteConfirm = useCallback(() => {
    onDeleteKhatedar(khatedar.id);
    setKhatedarDeleteOpen(false);
  }, [khatedar.id, onDeleteKhatedar]);

  return (
    <>
      <div className="bg-white rounded-xl shadow-ambient overflow-hidden">
        <div className="p-4">
          {/* Header row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0"
                style={{
                  background: positive ? AVATAR_COLOR_POS : AVATAR_COLOR_NEG,
                }}
              >
                {khatedar.name[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p
                    className="text-sm font-bold text-[#121c28]"
                    style={{ fontFamily: "Manrope, sans-serif" }}
                  >
                    {khatedar.name}
                  </p>
                  {khatedar.isActive ? (
                    <Badge
                      variant="default"
                      className="text-[8px] h-3.5 px-1 font-black uppercase"
                    >
                      Active
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[8px] h-3.5 px-1 font-black uppercase"
                    >
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#43474f]">
                  {khatedar.phone || "—"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="text-right">
                <p
                  className={`text-xl font-bold ${positive ? "text-[#006c49]" : "text-[#ba1a1a]"}`}
                  style={{ fontFamily: "Manrope, sans-serif" }}
                >
                  {positive ? "+" : ""}
                  {formatRupee(balance)}
                </p>
                <p
                  className={`text-[10px] ${positive ? "text-[#006c49]" : "text-[#ba1a1a]"}`}
                >
                  {positive ? "Wo humhe dena hai" : "Hum unhe dene hain"}
                </p>
              </div>
              <button
                onClick={() => setKhatedarDeleteOpen(true)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-[#fff0f0] text-[#ba1a1a] transition-colors mt-0.5 shrink-0"
                aria-label={`Delete ${khatedar.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Entry table */}
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <EntryTable
              entries={entries}
              onEditEntry={() => {}} // TODO: Implement edit in KhatedarCard if needed
              onDeleteEntry={handleEntryDeleteRequest}
              deletingId={isDeletingEntry ? pendingDeleteEntryId : null}
            />
          )}

          {/* Add entry button */}
          <Button
            variant="default"
            className="w-full mt-3"
            onClick={handleAddEntry}
          >
            <Plus className="w-3 h-3" /> Add Entry
          </Button>
        </div>
      </div>

      {/* Delete entry confirmation */}
      <DeleteConfirmDialog
        open={!!pendingDeleteEntryId}
        title="Entry delete karein?"
        description="Yeh entry hamesha ke liye hat jayegi aur baaki entries ka balance recalculate hoga."
        onConfirm={handleEntryDeleteConfirm}
        onCancel={() => setPendingDeleteEntryId(null)}
        isPending={isDeletingEntry}
      />

      {/* Delete khatedar confirmation */}
      <DeleteConfirmDialog
        open={khatedarDeleteOpen}
        title={`"${khatedar.name}" ko delete karein?`}
        description="Is khatedar aur unki saari entries delete ho jayengi. Yeh action undo nahi ho sakta."
        onConfirm={handleKhatedarDeleteConfirm}
        onCancel={() => setKhatedarDeleteOpen(false)}
        isPending={isDeletingPerson}
      />
    </>
  );
});
