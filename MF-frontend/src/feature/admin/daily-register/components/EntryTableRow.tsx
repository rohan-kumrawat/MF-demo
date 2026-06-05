// src/feature/admin/daily-register/components/EntryTableRow.tsx
import { Check, Edit2, Loader2, Trash2, X } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import type { RegisterEntry, CreateEntryDto } from "../types";
import { CellInput } from "./CellInput";
import { UpiSelect } from "./UpiSelect";
import { UdharKhataCell } from "./UdharKhataCell";

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

interface EntryTableRowProps {
  entry: RegisterEntry;
  entryDate: string;
  isEditing: boolean;
  editForm: Partial<CreateEntryDto> & { timeInput?: string; upiMode?: string };
  setEditForm: (f: any) => void;
  onStartEdit: (e: RegisterEntry) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
  isDeleting: boolean;
}

function AmountCell({
  value,
  colorClass,
}: {
  value: number | string | undefined;
  colorClass: string;
}) {
  return (
    <div className={`px-2 text-right font-semibold tabular-nums ${colorClass}`}>
      {n(value) > 0 ? (
        fmt(value)
      ) : (
        <span className="text-slate-300 font-normal">—</span>
      )}
    </div>
  );
}

export function EntryTableRow({
  entry: e,
  entryDate,
  isEditing,
  editForm: form,
  setEditForm: setForm,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  isUpdating,
  isDeleting,
}: EntryTableRowProps) {
  const cellClasses = `p-0 border border-slate-300 align-middle transition-colors focus-within:bg-slate-50 ${isEditing ? "bg-transparent" : "bg-white"}`;
  const inputClasses =
    "h-10 w-full bg-transparent shadow-none border-0 rounded-none focus:ring-0 px-4 font-bold text-slate-700";

  return (
    <TableRow
      className={`group transition-all duration-200 ${
        isEditing
          ? "bg-blue-50/80 z-20 relative ring-2 ring-blue-500 shadow-md"
          : "bg-white border-b border-slate-300"
      }`}
    >
      {/* UPI */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <UpiSelect
            value={form?.upi}
            onChange={(v) => setForm({ ...form, upi: v })}
            className="h-10 w-full bg-transparent shadow-none border-0 rounded-none focus:bg-white/50"
          />
        ) : (
          <div className="px-4 py-2.5">
            <span className="px-1 text-[11px] text-cyan-700 font-extrabold uppercase tracking-wider">
              {(e as any).upi ?? <span className="text-slate-300">—</span>}
            </span>
          </div>
        )}
      </TableCell>

      {/* Add Amount (+) */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            value={form?.addAmount}
            onChange={(v?: number) => setForm({ ...form, addAmount: v })}
            className={`${inputClasses} text-slate-900`}
          />
        ) : (
          <div className="px-4 py-2.5">
            <AmountCell value={e.addAmount} colorClass="text-emerald-700" />
          </div>
        )}
      </TableCell>

      {/* Pay In (+) */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            value={form?.payIn}
            onChange={(v?: number) => setForm({ ...form, payIn: v })}
            className={inputClasses}
          />
        ) : (
          <div className="px-4 py-2.5">
            <AmountCell value={e.payIn} colorClass="text-blue-700" />
          </div>
        )}
      </TableCell>

      {/* Pay Out (-) */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            value={form?.payOut}
            onChange={(v?: number) => setForm({ ...form, payOut: v })}
            className={inputClasses}
          />
        ) : (
          <div className="px-4 py-2.5">
            <AmountCell value={e.payOut} colorClass="text-orange-600" />
          </div>
        )}
      </TableCell>

      {/* Withdraw (-) */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            value={form?.withdraw}
            onChange={(v?: number) => setForm({ ...form, withdraw: v })}
            className={inputClasses}
          />
        ) : (
          <div className="px-4 py-2.5">
            <AmountCell value={e.withdraw} colorClass="text-red-600" />
          </div>
        )}
      </TableCell>

      {/* Recharge (-) */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            value={form?.recharge}
            onChange={(v?: number) => setForm({ ...form, recharge: v })}
            className={inputClasses}
          />
        ) : (
          <div className="px-4 py-2.5">
            <AmountCell value={e.recharge} colorClass="text-purple-700" />
          </div>
        )}
      </TableCell>

      {/* Commission (+) */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            value={form?.commission}
            onChange={(v?: number) => setForm({ ...form, commission: v })}
            className={inputClasses}
          />
        ) : (
          <div className="px-4 py-2.5">
            <AmountCell value={e.commission} colorClass="text-yellow-700" />
          </div>
        )}
      </TableCell>

      {/* Udhar Khata */}
      <TableCell className={cellClasses}>
        <UdharKhataCell remark={e.remark} entryDate={entryDate} />
      </TableCell>

      {/* Remark */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            type="text"
            value={form?.remark}
            placeholder="Add note..."
            onChange={(v: string) => setForm({ ...form, remark: v })}
            className={`${inputClasses} font-medium`}
          />
        ) : (
          <div className="px-4 py-2.5">
            <span className="px-1 text-slate-700 font-medium text-[11px] leading-relaxed">
              {e.remark || <span className="text-slate-300">—</span>}
            </span>
          </div>
        )}
      </TableCell>

      {/* Time */}
      <TableCell className={cellClasses}>
        {isEditing ? (
          <CellInput
            type="time"
            value={form?.timeInput}
            onChange={(v: string) => setForm({ ...form, timeInput: v })}
            className={inputClasses}
          />
        ) : (
          <div className="px-4 py-2.5">
            <span className="px-1 text-slate-500 font-bold font-mono tracking-tight text-[11px]">
              {formatTimeForInput(e.entryTime)}
            </span>
          </div>
        )}
      </TableCell>

      {/* Balance */}
      <TableCell
        className={`p-0 border border-slate-300 align-middle text-right tabular-nums ${isEditing ? "bg-blue-100/50" : "bg-slate-50/80"}`}
      >
        <div className="px-4 py-2.5 font-black text-slate-900">
          {fmt(e.balanceAfter)}
        </div>
      </TableCell>

      {/* Actions */}
      <TableCell
        className={`p-0 border border-l-2   border-slate-400 align-middle text-center sticky right-0 z-10 transition-colors ${isEditing ? "bg-blue-100/90 shadow-[-4px_0_12px_-4px_rgba(59,130,246,0.3)]" : "bg-white"}`}
      >
        {isEditing ? (
          <div className="flex items-center justify-center gap-1.5 h-10 px-2">
            <button
              onClick={onSaveEdit}
              className="p-1.5 rounded-full text-emerald-600  hover:bg-emerald-50 hover:scale-110 transition-all active:scale-95"
              title="Save"
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onCancelEdit}
              className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100 hover:scale-110 transition-all active:scale-95"
              title="Cancel"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <div className="flex items-center  justify-center gap-1.5 h-10 px-2">
            <button
              onClick={() => onStartEdit(e)}
              className="p-1.5 rounded-full text-slate-400 hover:text-[#005eb0] hover:bg-blue-50 transition-all"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(e.id)}
              className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
