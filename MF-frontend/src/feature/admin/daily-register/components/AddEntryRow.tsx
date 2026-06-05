// src/feature/admin/daily-register/components/AddEntryRow.tsx
import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { FormState } from "../types";
import { CellInput } from "./CellInput";
import { UpiSelect } from "./UpiSelect";
import { UdharKhataCellAddEntry } from "./UdharKhataCellAddEntry";

interface AddEntryRowProps {
  addForm: FormState;
  setAddForm: (f: FormState) => void;
  onSave: () => void;
  isAdding: boolean;
  colSpan: number;
}

export function AddEntryRow({
  addForm,
  setAddForm,
  onSave,
  isAdding,
}: AddEntryRowProps) {
  // Standardized border and background for all cells
  const cellClasses =
    "p-0 border border-slate-300 align-middle bg-white transition-colors focus-within:bg-slate-50";
  const inputClasses =
    "h-10 w-full bg-transparent shadow-none border-0 rounded-none focus:ring-0 px-4 font-bold text-slate-700";

  return (
    <TableRow className="bg-white border-t-2 border-slate-400 shadow-sm">
      {/* UPI */}
      <TableCell className={cellClasses}>
        <UpiSelect
          value={addForm.upi}
          onChange={(v) => setAddForm({ ...addForm, upi: v })}
          className="h-10 w-full bg-transparent shadow-none border-0 rounded-none focus:bg-slate-50"
        />
      </TableCell>

      {/* Add Amount */}
      <TableCell className={cellClasses}>
        <CellInput
          value={addForm.addAmount}
          placeholder="0"
          onChange={(v?: number) => setAddForm({ ...addForm, addAmount: v })}
          className={`${inputClasses} text-slate-900`}
        />
      </TableCell>

      {/* Pay In */}
      <TableCell className={cellClasses}>
        <CellInput
          value={addForm.payIn}
          placeholder="0"
          onChange={(v?: number) => setAddForm({ ...addForm, payIn: v })}
          className={inputClasses}
        />
      </TableCell>

      {/* Pay Out */}
      <TableCell className={cellClasses}>
        <CellInput
          value={addForm.payOut}
          placeholder="0"
          onChange={(v?: number) => setAddForm({ ...addForm, payOut: v })}
          className={inputClasses}
        />
      </TableCell>

      {/* Withdraw */}
      <TableCell className={cellClasses}>
        <CellInput
          value={addForm.withdraw}
          placeholder="0"
          onChange={(v?: number) => setAddForm({ ...addForm, withdraw: v })}
          className={inputClasses}
        />
      </TableCell>

      {/* Recharge */}
      <TableCell className={cellClasses}>
        <CellInput
          value={addForm.recharge}
          placeholder="0"
          onChange={(v?: number) => setAddForm({ ...addForm, recharge: v })}
          className={inputClasses}
        />
      </TableCell>

      {/* Commission */}
      <TableCell className={cellClasses}>
        <CellInput
          value={addForm.commission}
          placeholder="0"
          onChange={(v?: number) => setAddForm({ ...addForm, commission: v })}
          className={inputClasses}
        />
      </TableCell>

      {/* Udhar Khata */}
      <TableCell className={cellClasses}>
        <UdharKhataCellAddEntry addForm={addForm} isAdding={isAdding} />
      </TableCell>

      {/* Remark */}
      <TableCell className={cellClasses}>
        <CellInput
          type="text"
          placeholder="Note / Remark..."
          value={addForm.remark}
          onChange={(v: string) => setAddForm({ ...addForm, remark: v })}
          className={`${inputClasses} font-medium`}
        />
      </TableCell>

      {/* Time */}
      <TableCell className={cellClasses}>
        <CellInput
          type="time"
          value={addForm.timeInput}
          onChange={(v: string) => setAddForm({ ...addForm, timeInput: v })}
          className={inputClasses}
        />
      </TableCell>

      {/* Balance */}
      <TableCell className="p-0 border border-slate-300 align-middle bg-slate-50 text-right">
        <div className="px-4 py-3">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            Auto
          </span>
        </div>
      </TableCell>

      {/* Add button */}
      <TableCell className="p-0 border border-slate-300 align-middle text-center sticky right-0 z-10 bg-white">
        <div className="p-1">
          <Button onClick={onSave} disabled={isAdding} variant="split">
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "SAVE ENTRY"
            )}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
