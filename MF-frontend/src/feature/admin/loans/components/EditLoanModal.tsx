import { useEffect, useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, X, Edit3 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLoanMutations } from "../hooks/useLoans";
import { extendedLoanSchema, type LoanFormData } from "./CreateLoan/types";
import type { Loan, UpdateLoanDto } from "../types";
import { localDateStr } from "@/lib/utils";
import { LoanParametersSection } from "./CreateLoan/LoanParametersSection";
import { GuarantorsSection } from "./CreateLoan/GuarantorsSection";
import { FamilyMembersSection } from "./CreateLoan/FamilyMembersSection";

interface EditLoanModalProps {
  loan: Loan;
  isOpen: boolean;
  onClose: () => void;
}

export function EditLoanModal({ loan, isOpen, onClose }: EditLoanModalProps) {
  const { updateLoan, isUpdatingLoan } = useLoanMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const methods = useForm<LoanFormData>({
    resolver: zodResolver(extendedLoanSchema),
    defaultValues: {
      customerId: loan.customerId,
      loanType: loan.loanType,
      principalAmount: Number(loan.principalAmount),
      interestRate: Number(loan.interestRate),
      tenureMonths: Number(loan.tenureMonths || 0),
      fileCharge: Number(loan.fileCharge || 0),
      otherCharge: Number(loan.otherCharge || 0),
      totalPayable: Number(loan.totalPayable),
      emiAmount: Number(loan.emiAmount || 0),
      dailyInstallment: Number(loan.dailyInstallment || 0),
      weeklyInstallment: Number(loan.weeklyInstallment || 0),
      totalDays: Number(loan.totalDays || 0),
      totalWeeks: Number(loan.totalWeeks || 0),
      startDate: loan.startDate ? localDateStr(new Date(loan.startDate)) : "",
      emiPaymentMode: loan.emiPaymentMode,
      purposeOfLoan: loan.purposeOfLoan || "",
      guarantors: loan.guarantors || [],
      familyMembers: loan.familyMembers || [],
      hasPreviousLoan: loan.hasPreviousLoan || false,
      previousLoanAmount: Number(loan.previousLoanAmount || 0),
      previousLoanStatus: loan.previousLoanStatus || "",
      fatherOrHusbandName: loan.fatherOrHusbandName || "",
      aadharNumber: loan.aadharNumber || "",
      accountNumber: loan.accountNumber || "",
      notes: loan.notes || "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors, isDirty },
  } = methods;

  // We only reset the form when the modal opens with a new loan
  useEffect(() => {
    if (isOpen) {
      reset({
        customerId: loan.customerId,
        loanType: loan.loanType,
        principalAmount: Number(loan.principalAmount),
        interestRate: Number(loan.interestRate),
        tenureMonths: Number(loan.tenureMonths || 0),
        fileCharge: Number(loan.fileCharge || 0),
        otherCharge: Number(loan.otherCharge || 0),
        totalPayable: Number(loan.totalPayable),
        emiAmount: Number(loan.emiAmount || 0),
        dailyInstallment: Number(loan.dailyInstallment || 0),
        weeklyInstallment: Number(loan.weeklyInstallment || 0),
        totalDays: Number(loan.totalDays || 0),
        totalWeeks: Number(loan.totalWeeks || 0),
        startDate: loan.startDate ? localDateStr(new Date(loan.startDate)) : "",
        emiPaymentMode: loan.emiPaymentMode,
        purposeOfLoan: loan.purposeOfLoan || "",
        guarantors: loan.guarantors || [],
        familyMembers: loan.familyMembers || [],
        hasPreviousLoan: loan.hasPreviousLoan || false,
        previousLoanAmount: Number(loan.previousLoanAmount || 0),
        previousLoanStatus: loan.previousLoanStatus || "",
        fatherOrHusbandName: loan.fatherOrHusbandName || "",
        aadharNumber: loan.aadharNumber || "",
        accountNumber: loan.accountNumber || "",
        notes: loan.notes || "",
      });
      setTimeout(() => setSubmitError(null), 0);
    }
  }, [isOpen, loan, reset]);

  const {
    fields: guarantorFields,
    append: appendGuarantor,
    remove: removeGuarantor,
  } = useFieldArray({ control, name: "guarantors" });

  const {
    fields: familyFields,
    append: appendFamily,
    remove: removeFamily,
  } = useFieldArray({ control, name: "familyMembers" });

  const onSubmit = async (data: LoanFormData) => {
    setSubmitError(null);

    // Explicit DTO creation - omitting loanType and customerId
    const dto: UpdateLoanDto = {
      principalAmount: data.principalAmount,
      interestRate: data.interestRate,
      tenureMonths: data.tenureMonths,
      fileCharge: data.fileCharge,
      otherCharge: data.otherCharge,
      totalPayable: data.totalPayable,
      emiAmount: data.emiAmount,
      dailyInstallment: data.dailyInstallment,
      totalDays: data.totalDays,
      weeklyInstallment: data.weeklyInstallment,
      totalWeeks: data.totalWeeks,
      startDate: data.startDate,
      purposeOfLoan: data.purposeOfLoan,
      emiPaymentMode: data.emiPaymentMode,
      guarantors: data.guarantors,
      familyMembers: data.familyMembers,
      fatherOrHusbandName: data.fatherOrHusbandName,
      aadharNumber: data.aadharNumber,
      accountNumber: data.accountNumber,
      hasPreviousLoan: data.hasPreviousLoan,
      previousLoanAmount: data.previousLoanAmount,
      previousLoanStatus: data.previousLoanStatus,
      notes: data.notes,
    };

    try {
      await updateLoan.mutateAsync({ id: loan.id, dto });
      toast.success("Loan updated successfully");
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || "Failed to update loan";
      setSubmitError(msg);
      toast.error(msg);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl bg-[#f4f6fa] rounded-2xl p-0 overflow-hidden border-none flex flex-col h-[90vh]">
        <DialogHeader className="p-6 bg-white border-b border-slate-100 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl text-slate-800">
            <Edit3 className="size-5 text-[#005eb0]" />
            Edit Loan - {loan.loanAccountNumber}
          </DialogTitle>
          <div className="absolute right-4 top-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <FormProvider {...methods}>
            <form
              id="edit-loan-form"
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-6"
            >
              {submitError && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
                  {submitError}
                </div>
              )}

              <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl border border-yellow-200 mb-6 font-medium">
                Note: Loan Type and Customer cannot be changed after creation.
                All other fields are editable. Recalculation will happen
                automatically.
              </div>

              {/* Customer Info (Read-only for search, editable for details) */}
              <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-6">
                <h3 className="text-sm font-black text-[#121c28] flex items-center gap-2 mb-4 pb-3 border-b border-[#c1c6d5]/20">
                  Customer & KYC Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-[#43474f] mb-1.5 block">
                      Customer Name
                    </label>
                    <Input
                      value={loan.customer?.name || ""}
                      readOnly
                      className="bg-slate-50 opacity-70 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#43474f] mb-1.5 block">
                      Father / Husband Name
                    </label>
                    <Input
                      {...register("fatherOrHusbandName")}
                      className={
                        errors.fatherOrHusbandName ? "border-red-500" : ""
                      }
                    />
                    {errors.fatherOrHusbandName && (
                      <p className="text-[10px] text-[#ba1a1a] mt-1">
                        {errors.fatherOrHusbandName.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#43474f] mb-1.5 block">
                      Aadhar Number
                    </label>
                    <Input
                      {...register("aadharNumber")}
                      maxLength={12}
                      className={errors.aadharNumber ? "border-red-500" : ""}
                    />
                    {errors.aadharNumber && (
                      <p className="text-[10px] text-[#ba1a1a] mt-1">
                        {errors.aadharNumber.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#43474f] mb-1.5 block">
                      Account No.
                    </label>
                    <Input
                      {...register("accountNumber")}
                      className={errors.accountNumber ? "border-red-500" : ""}
                    />
                  </div>
                </div>
              </div>

              {/* We reuse the components for the rest */}
              <LoanParametersSection
                register={register}
                setValue={setValue}
                errors={errors}
                control={control}
                isEditMode={true}
              />

              <GuarantorsSection
                register={register}
                errors={errors}
                fields={guarantorFields}
                append={appendGuarantor}
                remove={removeGuarantor}
              />

              <FamilyMembersSection
                register={register}
                errors={errors}
                fields={familyFields}
                append={appendFamily}
                remove={removeFamily}
              />
            </form>
          </FormProvider>
        </div>

        <div className="p-4 bg-white border-t flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-loan-form"
            disabled={isUpdatingLoan || !isDirty}
            className="px-6 py-2.5 text-sm font-bold text-white bg-[#005eb0] hover:bg-[#004e90] disabled:bg-slate-300 disabled:text-slate-500 rounded-xl flex items-center gap-2 transition-all shadow-md"
          >
            {isUpdatingLoan ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
