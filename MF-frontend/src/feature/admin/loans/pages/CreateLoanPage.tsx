// src/feature/admin/loans/pages/CreateLoanPage.tsx
import { useState } from "react";
import { useForm, useFieldArray, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useLoanMutations } from "../hooks/useLoans";
import {
  extendedLoanSchema,
  type LoanFormData,
} from "../components/CreateLoan/types";
import type { CreateLoanDto } from "../types";
import { LoanFormHeader } from "../components/CreateLoan/LoanFormHeader";
import { BorrowerDetailsSection } from "../components/CreateLoan/BorrowerDetailsSection";
import { LoanParametersSection } from "../components/CreateLoan/LoanParametersSection";
import { GuarantorsSection } from "../components/CreateLoan/GuarantorsSection";
import { FamilyMembersSection } from "../components/CreateLoan/FamilyMembersSection";
import { PreviousLoanSection } from "../components/CreateLoan/PreviousLoanSection";
import { LoanSummaryPanel } from "../components/CreateLoan/LoanSummaryPanel";
import { localToday } from "@/lib/utils";

const today = localToday();

export default function CreateLoanPage() {
  const navigate = useNavigate();
  const { createLoan, isCreatingLoan } = useLoanMutations();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedApplicationNo, setSubmittedApplicationNo] = useState<
    string | null
  >(null);

  const methods = useForm<LoanFormData>({
    resolver: zodResolver(extendedLoanSchema),
    defaultValues: {
      loanType: "emi",
      customerName: "",
      fileCharge: 0,
      otherCharge: 0,
      startDate: today,
      emiPaymentMode: "cash",
      guarantors: [],
      familyMembers: [],
      hasPreviousLoan: false,
      fatherOrHusbandName: "",
      aadharNumber: "",
      memberSince: "",
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    control,
    setError,
    formState: { errors },
  } = methods;

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
    // Prevent double submit — if already submitted, do nothing
    if (submittedApplicationNo) return;

    setSubmitError(null);

    // Explicit DTO creation - excluding show-only fields like memberSince
    const dto: CreateLoanDto = {
      customerId: data.customerId,
      loanType: data.loanType,
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
      const createdLoan = await createLoan.mutateAsync(dto);
      setSubmittedApplicationNo(createdLoan.loanAccountNumber);
    } catch (err: unknown) {
      interface BackendFieldError {
        field: string;
        message: string;
      }
      interface BackendErrorResponse {
        statusCode: number;
        error: string;
        message: string;
        errors?: BackendFieldError[];
      }
      const data = (err as { response?: { data?: BackendErrorResponse } })
        ?.response?.data;
      if (data?.errors?.length) {
        data.errors.forEach(({ field, message }) => {
          setError(field as Parameters<typeof setError>[0], {
            type: "server",
            message,
          });
        });
        setSubmitError(data.message ?? "Please fix the errors below.");
      } else {
        setSubmitError(data?.message ?? "Failed to create loan.");
      }
    }
  };

  return (
    <div className="p-4 lg:p-6 flex-1 bg-[#f4f6fa] animate-fade-in">
      {/* Back navigation */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
        <button
          type="button"
          onClick={() => navigate("/admin/loans")}
          className="flex items-center gap-2 text-sm text-[#43474f] hover:text-[#005eb0] transition-colors font-bold"
        >
          <ArrowLeft className="size-4" />
          Back to Loans
        </button>
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit, (errors) => {
            console.error("Form Validation Errors:", errors);
          })}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
        >
          {/* LEFT — form sections */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <LoanFormHeader />

            <BorrowerDetailsSection
              register={register}
              setValue={setValue}
              errors={errors}
              control={control}
            />

            <LoanParametersSection
              register={register}
              setValue={setValue}
              errors={errors}
              control={control}
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

            <PreviousLoanSection
              register={register}
              errors={errors}
              control={control}
            />
          </div>

          {/* RIGHT — sticky summary + actions */}
          <div className="lg:col-span-4">
            <LoanSummaryPanel
              register={register}
              errors={errors}
              control={control}
              isCreatingLoan={isCreatingLoan}
              submitError={submitError}
              onCancel={() => navigate("/admin/loans")}
              submittedApplicationNo={submittedApplicationNo}
              onDone={() => navigate("/admin/loans")}
            />
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
