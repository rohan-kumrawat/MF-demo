// src/feature/admin/loans/schemas/loan.schema.ts
import * as z from "zod";

/** Validates Aadhar: empty string is allowed; if provided must be 12 digits. */
const aadharField = z
  .string()
  .optional()
  .refine(
    (v) => !v || /^\d{12}$/.test(v),
    "Enter a valid 12-digit Aadhar number",
  );

export const guarantorSchema = z.object({
  customerId: z.string().uuid().optional(),
  name: z.string().min(2, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  relation: z.string().min(2, "Relation is required"),
  aadharNumber: aadharField,
  address: z.string().min(2, "Address is required"),
});

export const familyMemberSchema = z.object({
  name: z.string().min(2, "Name is required"),
  relation: z.string().min(2, "Relation is required"),
  phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
  aadharNumber: aadharField,
});

export const createLoanSchema = z
  .object({
    customerId: z.string().uuid("Select a valid customer"),
    customerName: z.string().optional(),
    customerPhone: z.string().optional(),
    customerAddress: z.string().optional(),

    fatherOrHusbandName: z.string().optional(),
    aadharNumber: aadharField,
    accountNumber: z.string().optional(),
    memberSince: z.string().optional(),

    loanType: z.enum(["emi", "bullet", "flexible", "weekly"]),
    principalAmount: z
      .number({ error: "Principal amount is required" })
      .positive("Principal must be positive"),
    interestRate: z
      .number({ error: "Interest rate is required" })
      .min(0, "Must be 0 or more")
      .max(100, "Cannot exceed 100%"),
    // Allow 0 — enforced conditionally in superRefine (flexible has no tenure)
    tenureMonths: z
      .number({ error: "Tenure is required" })
      .int("Must be a whole number")
      .min(0),
    fileCharge: z.number().min(0),
    otherCharge: z.number().min(0),
    totalPayable: z
      .number({ error: "Total payable is required" })
      .positive("Total payable must be positive"),
    // Allow 0 — enforced conditionally in superRefine (only required for EMI)
    emiAmount: z.number().min(0),
    dailyInstallment: z.number().min(0).optional(),
    totalDays: z.number().int().min(0).optional(),
    weeklyInstallment: z.number().min(0).optional(),
    totalWeeks: z.number().int().min(0).optional(),
    startDate: z.string().min(1, "Start date is required"),
    purposeOfLoan: z.string().optional(),
    emiPaymentMode: z.enum(["cash", "upi", "bank"]),

    guarantors: z.array(guarantorSchema).max(2, "Maximum 2 guarantors allowed"),
    familyMembers: z.array(familyMemberSchema),

    hasPreviousLoan: z.boolean(),
    previousLoanAmount: z.number().optional(),
    previousLoanStatus: z.string().optional(),

    notes: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // tenureMonths is required and must be ≥ 1 for EMI and Bullet loans
    if (
      (data.loanType === "emi" || data.loanType === "bullet") &&
      data.tenureMonths <= 0
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Must be at least 1 month",
        path: ["tenureMonths"],
      });
    }

    // emiAmount must be positive only for EMI loans
    if (data.loanType === "emi" && (!data.emiAmount || data.emiAmount <= 0)) {
      ctx.addIssue({
        code: "custom",
        message: "EMI amount is required",
        path: ["emiAmount"],
      });
    }

    if (data.loanType === "flexible") {
      if (!data.dailyInstallment || data.dailyInstallment <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Daily installment is required",
          path: ["dailyInstallment"],
        });
      }
      if (!data.totalDays || data.totalDays <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Total days is required",
          path: ["totalDays"],
        });
      }
    }

    if (data.loanType === "weekly") {
      if (!data.weeklyInstallment || data.weeklyInstallment <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Weekly installment is required",
          path: ["weeklyInstallment"],
        });
      }
      if (!data.totalWeeks || data.totalWeeks <= 0) {
        ctx.addIssue({
          code: "custom",
          message: "Total weeks is required",
          path: ["totalWeeks"],
        });
      }
    }

    if (
      data.hasPreviousLoan &&
      (!data.previousLoanAmount || data.previousLoanAmount <= 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Previous loan amount is required and must be positive",
        path: ["previousLoanAmount"],
      });
    }
  });

export const transactionSchema = z.object({
  type: z.enum(["emi", "full_payment", "penalty", "other"]),
  amount: z.number().positive("Amount must be positive"),
  paymentMode: z.enum(["cash", "upi", "bank"]),
  paymentDate: z.string().min(1, "Payment date is required"),
  notes: z.string().optional(),
  diaryAmount: z.number().optional().catch(undefined),
  diaryAccountId: z.string().optional().or(z.literal("none")),
});

export const editTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive").optional(),
  paymentMode: z.enum(["cash", "upi", "bank"]).optional(),
  paymentDate: z.string().min(1, "Payment date is required").optional(),
  notes: z.string().optional(),
});

export type CreateLoanFormData = z.infer<typeof createLoanSchema>;
export type TransactionFormData = z.infer<typeof transactionSchema>;
export type EditTransactionFormData = z.infer<typeof editTransactionSchema>;
