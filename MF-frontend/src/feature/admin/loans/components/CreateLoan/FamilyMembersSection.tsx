// src/feature/admin/loans/components/CreateLoan/FamilyMembersSection.tsx
import {
  type UseFormRegister,
  type FieldErrors,
  type UseFieldArrayReturn,
} from "react-hook-form";
import { Users, UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inputCls, labelCls, type LoanFormData } from "./types";

interface Props {
  register: UseFormRegister<LoanFormData>;
  errors: FieldErrors<LoanFormData>;
  fields: UseFieldArrayReturn<LoanFormData, "familyMembers">["fields"];
  append: UseFieldArrayReturn<LoanFormData, "familyMembers">["append"];
  remove: UseFieldArrayReturn<LoanFormData, "familyMembers">["remove"];
}

export function FamilyMembersSection({
  register,
  errors,
  fields,
  append,
  remove,
}: Props) {
  return (
    <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#c1c6d5]/20">
        <h3 className="text-sm font-black text-[#121c28] flex items-center gap-2">
          <Users className="size-4 text-[#1a8a58]" />
          Family Members
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ name: "", relation: "", aadharNumber: "", phone: "" })
          }
          className="flex items-center gap-1.5 text-xs font-bold text-[#1a8a58] border-[#1a8a58]/30 hover:bg-[#1a8a58]/5"
        >
          <UserPlus className="size-3.5" />
          Add Member
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-4 text-sm text-[#717784] font-medium">
          No family members added.
        </div>
      )}

      <div className="flex flex-col gap-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-wrap md:flex-nowrap gap-3 items-start relative p-3 bg-[#f8f9ff]/50 rounded-xl border border-[#c1c6d5]/20"
          >
            <div className="flex-1">
              <label className={labelCls}>Name</label>
              <Input
                {...register(`familyMembers.${index}.name`)}
                className={inputCls(!!errors.familyMembers?.[index]?.name)}
              />
              {errors.familyMembers?.[index]?.name && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.familyMembers[index]?.name?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className={labelCls}>Relation</label>
              <Input
                {...register(`familyMembers.${index}.relation`)}
                className={inputCls(!!errors.familyMembers?.[index]?.relation)}
              />
              {errors.familyMembers?.[index]?.relation && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.familyMembers[index]?.relation?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className={labelCls}>Aadhar No.</label>
              <Input
                {...register(`familyMembers.${index}.aadharNumber`)}
                inputMode="numeric"
                maxLength={12}
                placeholder="12-digit Aadhar"
                className={inputCls(
                  !!errors.familyMembers?.[index]?.aadharNumber,
                )}
              />
              {errors.familyMembers?.[index]?.aadharNumber && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.familyMembers[index]?.aadharNumber?.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <label className={labelCls}>Phone</label>
              <Input
                {...register(`familyMembers.${index}.phone`)}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="10-digit mobile"
                className={inputCls(!!errors.familyMembers?.[index]?.phone)}
              />
              {errors.familyMembers?.[index]?.phone && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.familyMembers[index]?.phone?.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="mt-7 p-2.5 bg-white text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-lg border border-[#ba1a1a]/20 shrink-0"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
