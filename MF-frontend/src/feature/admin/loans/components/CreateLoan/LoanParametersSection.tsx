// src/feature/admin/loans/components/CreateLoan/LoanParametersSection.tsx
import { useEffect } from "react";
import {
  type UseFormRegister,
  type FieldErrors,
  type Control,
  type UseFormSetValue,
} from "react-hook-form";
import { useWatch, Controller } from "react-hook-form";
import { FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/date-picker-field";
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
  setValue: UseFormSetValue<LoanFormData>;
  isEditMode?: boolean;
}

export function LoanParametersSection({
  register,
  errors,
  control,
  setValue,
  isEditMode,
}: Props) {
  const watchedLoanType = useWatch({ control, name: "loanType" });
  const principal = useWatch({ control, name: "principalAmount" }) ?? 0;
  const interestRate = useWatch({ control, name: "interestRate" }) ?? 0;
  const tenureMonths = useWatch({ control, name: "tenureMonths" }) ?? 0;
  const dailyInstallment = useWatch({ control, name: "dailyInstallment" }) ?? 0;
  const totalDays = useWatch({ control, name: "totalDays" }) ?? 0;
  const weeklyInstallment =
    useWatch({ control, name: "weeklyInstallment" }) ?? 0;
  const totalWeeks = useWatch({ control, name: "totalWeeks" }) ?? 0;
  const isFlexible = watchedLoanType === "flexible";
  const isWeekly = watchedLoanType === "weekly";

  // ─── Auto-calculate EMI + Total Payable ──────────────────────────────────
  useEffect(() => {
    if (
      watchedLoanType === "emi" &&
      principal &&
      interestRate &&
      tenureMonths > 0
    ) {
      const totalInterest =
        principal * (interestRate / 100) * (tenureMonths / 12);
      const totalPayable = Math.round((principal + totalInterest) * 100) / 100;
      const emi = Math.round((totalPayable / tenureMonths) * 100) / 100;
      setValue("emiAmount", emi, { shouldValidate: true });
      setValue("totalPayable", totalPayable, { shouldValidate: true });
    }

    if (
      watchedLoanType === "bullet" &&
      principal &&
      interestRate &&
      tenureMonths > 0
    ) {
      const totalInterest =
        principal * (interestRate / 100) * (tenureMonths / 12);
      setValue(
        "totalPayable",
        Math.round((principal + totalInterest) * 100) / 100,
        { shouldValidate: true },
      );
    }

    if (isFlexible && dailyInstallment > 0 && totalDays > 0) {
      setValue(
        "totalPayable",
        Math.round(dailyInstallment * totalDays * 100) / 100,
        { shouldValidate: true },
      );
    }

    if (isWeekly && weeklyInstallment > 0 && totalWeeks > 0) {
      setValue(
        "totalPayable",
        Math.round(weeklyInstallment * totalWeeks * 100) / 100,
        { shouldValidate: true },
      );
    }
  }, [
    watchedLoanType,
    principal,
    interestRate,
    tenureMonths,
    dailyInstallment,
    totalDays,
    weeklyInstallment,
    totalWeeks,
    isFlexible,
    isWeekly,
    setValue,
  ]);

  return (
    <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-6">
      <h3 className={sectionHeaderCls}>
        <FileText className="size-4 text-[#005eb0]" />
        Loan Requirements
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Loan Type */}
        <div>
          <label className={labelCls}>Loan Type *</label>
          <Controller
            name="loanType"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  field.onChange(val);
                  // Reset fields when loan type changes
                  setValue("interestRate", 0);
                  setValue("tenureMonths", 0);
                  setValue("emiAmount", 0);
                  setValue("totalPayable", 0);
                  setValue("dailyInstallment", 0);
                  setValue("totalDays", 0);
                  setValue("weeklyInstallment", 0);
                  setValue("totalWeeks", 0);
                }}
                defaultValue={field.value}
                disabled={isEditMode}
              >
                <SelectTrigger
                  className={
                    inputCls(!!errors.loanType) +
                    (isEditMode
                      ? " bg-slate-50 opacity-70 cursor-not-allowed"
                      : "")
                  }
                >
                  <SelectValue placeholder="Select Loan Type" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="emi">EMI</SelectItem>
                  <SelectItem value="bullet">Bullet</SelectItem>
                  <SelectItem value="flexible">Flexible (Daily)</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Purpose of Loan */}
        <div>
          <label className={labelCls}>Purpose of Loan</label>
          <Controller
            name="purposeOfLoan"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={inputCls()}>
                  <SelectValue placeholder="Select Purpose" />
                </SelectTrigger>
                <SelectContent position="popper" align="start">
                  <SelectItem value="business">Business (व्यापार)</SelectItem>
                  <SelectItem value="home">Home (घर)</SelectItem>
                  <SelectItem value="education">Education (शिक्षा)</SelectItem>
                  <SelectItem value="medical">Medical (चिकित्सा)</SelectItem>
                  <SelectItem value="other">Other (अन्य)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Payment Mode */}
        <div>
          <label className={labelCls}>Payment Mode *</label>
          <Controller
            name="emiPaymentMode"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className={inputCls(!!errors.emiPaymentMode)}>
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent align="start" position="popper">
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank">Cheque / Bank</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Principal Amount */}
        <div>
          <label className={labelCls}>Principal Amount (₹) *</label>
          <Input
            type="number"
            step="0.01"
            {...register("principalAmount", { valueAsNumber: true })}
            placeholder="e.g. 50000"
            className={inputCls(!!errors.principalAmount)}
          />
          {errors.principalAmount && (
            <p className="text-[10px] text-[#ba1a1a] mt-1">
              {errors.principalAmount.message}
            </p>
          )}
        </div>

        {/* Interest Rate — flexible/weekly me nahi dikhana */}
        {!isFlexible && !isWeekly && (
          <div>
            <label className={labelCls}>Interest Rate (% p.a.) *</label>
            <Input
              type="number"
              step="0.01"
              {...register("interestRate", { valueAsNumber: true })}
              placeholder="e.g. 18"
              className={inputCls(!!errors.interestRate)}
            />
            {errors.interestRate && (
              <p className="text-[10px] text-[#ba1a1a] mt-1">
                {errors.interestRate.message}
              </p>
            )}
          </div>
        )}

        {/* Start Date */}
        <div>
          <label className={labelCls}>Start Date *</label>
          <Controller
            name="startDate"
            control={control}
            render={({ field }) => (
              <DatePickerField
                value={field.value}
                onChange={field.onChange}
                buttonClassName={inputCls(!!errors.startDate)}
              />
            )}
          />
          {errors.startDate && (
            <p className="text-[10px] text-[#ba1a1a] mt-1">
              {errors.startDate.message}
            </p>
          )}
        </div>

        {/* Conditional: EMI / Bullet */}
        {!isFlexible && !isWeekly ? (
          <>
            <div>
              <label className={labelCls}>Tenure (Months) *</label>
              <Input
                type="number"
                {...register("tenureMonths", { valueAsNumber: true })}
                placeholder="e.g. 12"
                className={inputCls(!!errors.tenureMonths)}
              />
              {errors.tenureMonths && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.tenureMonths.message}
                </p>
              )}
            </div>

            {/* EMI Amount — auto-calculated for 'emi', manual for 'bullet' */}

            {watchedLoanType === "emi" && (
              <div>
                <label className={labelCls}>Monthly EMI (₹) — Auto</label>
                <Input
                  type="number"
                  step="0.01"
                  {...register("emiAmount", { valueAsNumber: true })}
                  placeholder="Auto-calculated"
                  readOnly={watchedLoanType === "emi"} // ← read-only for emi
                  className={
                    inputCls(!!errors.emiAmount) +
                    (watchedLoanType === "emi"
                      ? " bg-[#f0f4ff] cursor-not-allowed"
                      : "")
                  }
                />
                {errors.emiAmount && (
                  <p className="text-[10px] text-[#ba1a1a] mt-1">
                    {errors.emiAmount.message}
                  </p>
                )}
              </div>
            )}
          </>
        ) : isWeekly ? (
          <>
            <div>
              <label className={labelCls}>Per Week Amount (₹) *</label>
              <Input
                type="number"
                step="0.01"
                {...register("weeklyInstallment", { valueAsNumber: true })}
                placeholder="e.g. 500"
                className={inputCls(!!errors.weeklyInstallment)}
              />
              {errors.weeklyInstallment && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.weeklyInstallment.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Total Weeks *</label>
              <Input
                type="number"
                {...register("totalWeeks", { valueAsNumber: true })}
                placeholder="e.g. 52"
                className={inputCls(!!errors.totalWeeks)}
              />
              {errors.totalWeeks && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.totalWeeks.message}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <label className={labelCls}>Daily Installment (₹) *</label>
              <Input
                type="number"
                step="0.01"
                {...register("dailyInstallment", { valueAsNumber: true })}
                placeholder="e.g. 200"
                className={inputCls(!!errors.dailyInstallment)}
              />
              {errors.dailyInstallment && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.dailyInstallment.message}
                </p>
              )}
            </div>
            <div>
              <label className={labelCls}>Total Days *</label>
              <Input
                type="number"
                {...register("totalDays", { valueAsNumber: true })}
                placeholder="e.g. 100"
                className={inputCls(!!errors.totalDays)}
              />
              {errors.totalDays && (
                <p className="text-[10px] text-[#ba1a1a] mt-1">
                  {errors.totalDays.message}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
