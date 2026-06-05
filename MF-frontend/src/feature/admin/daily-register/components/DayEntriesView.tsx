// src/feature/admin/daily-register/components/DayEntriesView.tsx
import { useState } from "react";
import { ArrowLeft, Loader2, Printer } from "lucide-react";
import {
  useDayEntries,
  useDailyRegisterMutations,
} from "../hooks/useDailyRegister";
import type {
  DayRegister,
  RegisterEntry,
  CreateEntryDto,
  FormState,
} from "../types";
import { localToday } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EntryTableRow } from "./EntryTableRow";
import { AddEntryRow } from "./AddEntryRow";
import { udharKhataService } from "@/feature/admin/udhar-khata/services/udharKhataService";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (v: number | string) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(v) || 0);

const n = (v: number | string | undefined) => Number(v) || 0;

function formatTimeForInput(isoString?: string) {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function combineDateAndTime(dateStr: string, timeStr?: string) {
  if (!timeStr) return new Date().toISOString();
  try {
    const d = new Date(`${dateStr}T${timeStr}:00`);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

// ─── column definitions ──────────────────────────────────────────────────────
const HEADERS = [
  { label: "UPI", w: "w-32" },
  { label: "Add Amt (+)", w: "w-28 text-right" },
  { label: "Pay In (+)", w: "w-28 text-right" },
  { label: "Pay Out (-)", w: "w-28 text-right" },
  { label: "Withdraw (-)", w: "w-28 text-right" },
  { label: "Recharge (+)", w: "w-28 text-right" },
  { label: "Comm. (+)", w: "w-28 text-right" },
  { label: "Udhar", w: "w-24 text-center" },
  { label: "Remark", w: "w-34" },
  { label: "Time", w: "w-28" },
  { label: "Balance", w: "w-36 text-right" },
  { label: "Actions", w: "w-24 text-center" },
];

// FormState moved to types.ts

// ─── component ───────────────────────────────────────────────────────────────
interface Props {
  day: DayRegister;
  onBack: () => void;
}

export function DayEntriesView({ day, onBack }: Props) {
  const { data: entries = [], isLoading } = useDayEntries(day.id);
  const {
    addEntry,
    updateEntry,
    deleteEntry,
    isAdding,
    isUpdating,
    isDeleting,
  } = useDailyRegisterMutations();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>({});
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
    onCancel: () => {},
  });
  const [addForm, setAddForm] = useState<FormState>({
    timeInput: formatTimeForInput(new Date().toISOString()),
    entryDate: localToday(),
  });

  // ── totals ──
  const totals = entries.reduce(
    (acc, e) => {
      acc.income += n(e.commission);
      acc.totalIn += n(e.deposit) + n(e.addAmount) + n(e.recharge) + n(e.payIn);
      acc.totalOut += n(e.withdraw) + n(e.payOut);
      return acc;
    },
    { income: 0, totalIn: 0, totalOut: 0 },
  );

  // ── edit handlers ──
  const handleStartEdit = (e: RegisterEntry) => {
    setEditingId(e.id);
    setEditForm({
      withdraw: n(e.withdraw) || undefined,
      payIn: n(e.payIn) || undefined,
      payOut: n(e.payOut) || undefined,
      recharge: n(e.recharge) || undefined,
      commission: n(e.commission) || undefined,
      addAmount: n(e.addAmount) || undefined,
      remark: e.remark ?? "",
      timeInput: formatTimeForInput(e.entryTime),
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const dto: Partial<CreateEntryDto> = {
      upi: editForm.upi,
      withdraw: editForm.withdraw ?? 0,
      payIn: editForm.payIn ?? 0,
      payOut: editForm.payOut ?? 0,
      recharge: editForm.recharge ?? 0,
      commission: editForm.commission ?? 0,
      addAmount: editForm.addAmount ?? 0,
      remark: editForm.remark,
      entryTime: combineDateAndTime(day.entryDate, editForm.timeInput),
    };
    try {
      await updateEntry.mutateAsync({ id: editingId, dayId: day.id, dto });
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error("Failed to update", err);
    }
  };

  // ── add handler ──
  const handleSaveNew = async () => {
    const total =
      n(addForm.withdraw) +
      n(addForm.payIn) +
      n(addForm.payOut) +
      n(addForm.recharge) +
      n(addForm.commission) +
      n(addForm.addAmount);

    if (total <= 0) {
      alert("Please enter at least one transaction amount.");
      return;
    }

    const dto: CreateEntryDto = {
      upi: addForm.upi,
      withdraw: addForm.withdraw ?? 0,
      payIn: addForm.payIn ?? 0,
      payOut: addForm.payOut ?? 0,
      recharge: addForm.recharge ?? 0,
      commission: addForm.commission ?? 0,
      addAmount: addForm.addAmount ?? 0,
      remark: addForm.remark,
      entryTime: combineDateAndTime(day.entryDate, addForm.timeInput),
    };

    try {
      const promises: Promise<any>[] = [
        addEntry.mutateAsync({ dayId: day.id, dto }),
      ];

      if (addForm.udharKhata?.id && addForm.amount) {
        promises.push(
          udharKhataService.addEntry(addForm.udharKhata.id, {
            entryType: addForm.entryType || "liya",
            amount: Number(addForm.amount),
            remark: addForm.remark || "Added from Daily Register",
            entryDate: day.entryDate.split("T")[0],
          }),
        );
      }

      await Promise.all(promises);

      setAddForm({
        timeInput: formatTimeForInput(new Date().toISOString()),
        entryDate: day.entryDate,
      });
    } catch (err) {
      console.error("Failed to add", err);
    }
  };

  // ── delete handler ──
  const handleDelete = (id: string) => {
    setConfirmDialog({
      open: true,
      title: "Delete Entry",
      description:
        "Are you sure you want to delete this entry? This action cannot be undone.",
      onConfirm: async () => {
        await deleteEntry.mutateAsync({ id, dayId: day.id });
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
      onCancel: () => setConfirmDialog((prev) => ({ ...prev, open: false })),
    });
  };

  const handlePrint = () => {
    window.open(
      `/daily-register/print/${day.id}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Button
          variant="ghost"
          onClick={onBack}
          className="font-bold text-[#43474f] hover:text-[#005eb0]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Registers
        </Button>
        <div className="flex items-center gap-3 no-print">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print Day
          </Button>
        </div>
      </div>

      {/* Day stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <Card className="hover:border-[#005eb0]/30 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
              Opening Balance
            </CardTitle>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
          </CardHeader>
          <CardContent>
            <div className="text-xl text-slate-700 tabular-nums">
              {fmt(day.openingBalance)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#006c49]/30 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
              Income
            </CardTitle>
            <div className="w-1.5 h-1.5 rounded-full bg-[#006c49]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-[#006c49] tabular-nums">
              +{fmt(totals.income)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#1a8a58]/30 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
              Total In
            </CardTitle>
            <div className="w-1.5 h-1.5 rounded-full bg-[#1a8a58]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-[#1a8a58] tabular-nums">
              +{fmt(totals.totalIn)}
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-[#ba1a1a]/30 transition-all shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-bold text-muted-foreground uppercase tracking-widest">
              Total Out
            </CardTitle>
            <div className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-[#ba1a1a] tabular-nums">
              -{fmt(totals.totalOut)}
            </div>
          </CardContent>
        </Card>

        <Card className="ring-1 ring-[#001e40]/5 transition-all shadow-sm border-[#001e40]/10 bg-[#001e40]/2">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-lg font-bold text-[#001e40] uppercase tracking-widest">
              Closing Balance
            </CardTitle>
            <div className="w-1.5 h-1.5 rounded-full bg-[#001e40]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-black text-[#001e40] tabular-nums">
              {fmt(day.closingBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Spreadsheet table */}
      <Card className="shadow-sm border border-slate-200 overflow-hidden bg-white">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Financial Entries
            </h3>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {day.entryDate}
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200 tabular-nums shadow-sm">
            {entries.length} {entries.length === 1 ? "record" : "records"}
          </span>
        </div>

        {/* horizontal scroll wrapper */}
        <div className="overflow-x-auto w-full custom-scrollbar">
          <Table className="w-full text-md border-collapse">
            <TableHeader className="bg-slate-200 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent border-b-2 border-slate-200">
                {HEADERS.map((h, i) => {
                  const isActions = h.label === "Actions";
                  return (
                    <TableHead
                      key={i}
                      className={`h-11 px-4 text-[11px] font-extrabold text-slate-700 tracking-wider uppercase border-r-2 border-slate-200/60 last:border-r-0 ${
                        h.w
                      } ${
                        isActions
                          ? "sticky right-0 z-20 bg-slate-50/95 shadow-[-4px_0_12px_-4px_rgba(0,0,0,0.1)]"
                          : ""
                      }`}
                    >
                      {h.label}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={HEADERS.length}
                    className="h-32 text-center"
                  >
                    <Loader2 className="w-5 h-5 mx-auto animate-spin text-slate-400" />
                  </TableCell>
                </TableRow>
              ) : (
                entries.map((e) => (
                  <EntryTableRow
                    key={e.id}
                    entry={e}
                    entryDate={day.entryDate}
                    isEditing={editingId === e.id}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    onStartEdit={handleStartEdit}
                    onSaveEdit={handleSaveEdit}
                    onCancelEdit={handleCancelEdit}
                    onDelete={handleDelete}
                    isUpdating={isUpdating}
                    isDeleting={isDeleting}
                  />
                ))
              )}

              {/* Always-present "Add new" row */}
              <AddEntryRow
                addForm={addForm}
                setAddForm={setAddForm}
                onSave={handleSaveNew}
                isAdding={isAdding}
                colSpan={HEADERS.length}
              />
            </TableBody>
          </Table>
        </div>
      </Card>
      <DeleteConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        onCancel={confirmDialog.onCancel}
        isPending={isDeleting}
      />
    </div>
  );
}
