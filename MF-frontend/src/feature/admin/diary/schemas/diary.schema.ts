// src/feature/admin/diary/schemas/diary.schema.ts
import * as z from "zod";

export const createDiaryAccountSchema = z.object({
  customerId: z.string().min(1, "Customer select karo"),
  diaryName: z.string().optional(),
  openingBalance: z
    .number()
    .min(0, "Balance 0 se kam nahi ho sakta")
    .optional(),
});

// ✅ Derive type from schema — don't write it manually
export type CreateDiaryAccountFormData = z.infer<
  typeof createDiaryAccountSchema
>;

export const diaryActionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  transactionDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

export type DiaryActionFormData = z.infer<typeof diaryActionSchema>;

export const editDiaryTransactionSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  transactionDate: z.string().min(1, "Date is required"),
  notes: z.string().optional(),
});

export type EditDiaryTransactionFormData = z.infer<
  typeof editDiaryTransactionSchema
>;
