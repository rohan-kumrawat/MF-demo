// src/feature/admin/daily-register/schemas/daily-register.schema.ts
import * as z from "zod";

export const createDaySchema = z.object({
  entryDate: z.string().min(1, "Date is required"),
  openingBalance: z.number().min(0, "Opening balance cannot be negative"),
});

export const createEntrySchema = z
  .object({
    withdraw: z.number().min(0).optional(),
    payIn: z.number().min(0).optional(),
    payOut: z.number().min(0).optional(),
    recharge: z.number().min(0).optional(),
    commission: z.number().min(0).optional(),
    addAmount: z.number().min(0).optional(),
    remark: z.string().optional(),
    entryTime: z.string().optional(),
  })
  .refine(
    (data) => {
      return (
        (data.withdraw ?? 0) > 0 ||
        (data.payIn ?? 0) > 0 ||
        (data.payOut ?? 0) > 0 ||
        (data.recharge ?? 0) > 0 ||
        (data.commission ?? 0) > 0 ||
        (data.addAmount ?? 0) > 0
      );
    },
    {
      message:
        "At least one positive amount must be provided across all columns",
    },
  );

export type CreateDayFormData = z.infer<typeof createDaySchema>;
export type CreateEntryFormData = z.infer<typeof createEntrySchema>;
