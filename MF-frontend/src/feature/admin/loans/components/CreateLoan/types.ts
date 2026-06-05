// src/feature/admin/loans/components/CreateLoan/types.ts
import * as z from "zod";
import { createLoanSchema } from "../../schemas/loan.schema";

export const extendedLoanSchema = createLoanSchema.superRefine((data, ctx) => {
  if (data.loanType === "flexible") {
    if (!data.dailyInstallment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Daily installment is required",
        path: ["dailyInstallment"],
      });
    }
    if (!data.totalDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total days is required",
        path: ["totalDays"],
      });
    }
  }

  if (data.loanType === "weekly") {
    if (!data.weeklyInstallment) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Weekly installment is required",
        path: ["weeklyInstallment"],
      });
    }
    if (!data.totalWeeks) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Total weeks is required",
        path: ["totalWeeks"],
      });
    }
  }
});

export type LoanFormData = z.infer<typeof extendedLoanSchema>;

export const inputCls = (hasError?: boolean) =>
  `w-full px-4 py-2.5 bg-[#f8f9ff] border rounded-xl text-sm focus:outline-none transition-all ${
    hasError
      ? "border-[#ba1a1a] focus:border-[#ba1a1a] ring-1 ring-[#ba1a1a]/20"
      : "border-[#c3c6d1]/30 focus:border-[#005eb0] focus:ring-1 focus:ring-[#005eb0]/20"
  }`;

export const labelCls = "text-xs font-bold text-[#43474f] mb-1.5 block";

export const sectionHeaderCls =
  "text-sm font-black text-[#121c28] flex items-center gap-2 mb-4 pb-3 border-b border-[#c1c6d5]/20";
