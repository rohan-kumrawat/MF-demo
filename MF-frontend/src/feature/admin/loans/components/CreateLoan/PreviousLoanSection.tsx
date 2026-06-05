// src/feature/admin/loans/components/CreateLoan/PreviousLoanSection.tsx
import {
  type UseFormRegister,
  type FieldErrors,
  type Control,
} from "react-hook-form";
import { useWatch, Controller } from "react-hook-form";
import { History } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  inputCls,
  labelCls,
  sectionHeaderCls,
  type LoanFormData,
} from "./types";

interface Props {
  register: UseFormRegister<LoanFormData>;
  errors: FieldErrors<LoanFormData>;
  control: Control<LoanFormData>;
}

export function PreviousLoanSection({
  register: _register,
  errors,
  control,
}: Props) {
  const watchedHasPreviousLoan = useWatch({ control, name: "hasPreviousLoan" });

  return (
    <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-6">
      <h3 className={sectionHeaderCls}>
        <History className="size-4 text-[#005eb0]" />
        Previous Loan Details
      </h3>

      {/* Toggle checkbox via Controller so Radix handles its own checked state */}
      <div className="flex items-center gap-3 mb-4">
        <Controller
          name="hasPreviousLoan"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="hasPrevLoan"
              checked={field.value ?? false}
              onCheckedChange={field.onChange}
              className="border-[#c3c6d1]"
            />
          )}
        />
        <label
          htmlFor="hasPrevLoan"
          className="text-sm font-bold text-[#121c28] cursor-pointer select-none"
        >
          Has the applicant taken a loan before?
        </label>
      </div>

      {watchedHasPreviousLoan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-[#f8f9ff] rounded-xl border border-[#c1c6d5]/30">
          <div>
            <label className={labelCls}>Previous Loan Amount (₹)</label>
            <Controller
              name="previousLoanAmount"
              control={control}
              render={({ field }) => (
                <>
                  <Input
                    type="number"
                    step="0.01"
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    className={inputCls(!!errors.previousLoanAmount)}
                  />
                  {errors.previousLoanAmount && (
                    <p className="text-[10px] text-[#ba1a1a] mt-1">
                      {errors.previousLoanAmount.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>
          <div>
            <label className={labelCls}>Status</label>
            <Controller
              name="previousLoanStatus"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger className={inputCls()}>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent position="popper" align="start">
                    <SelectItem value="cleared">Cleared / Closed</SelectItem>
                    <SelectItem value="active">Active / Ongoing</SelectItem>
                    <SelectItem value="defaulted">Defaulted</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}
