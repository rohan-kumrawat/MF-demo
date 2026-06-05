import { z } from "zod";

export const createPersonSchema = z
  .object({
    name: z.string().min(1, "Naam zaroori hai"),
    phone: z.string().optional(),
    address: z.string().optional(),
    openingBalance: z
      .number({ message: "Sirf number daalo" })
      .min(0)
      .optional(),
    openingBalanceType: z.enum(["diya", "liya"]).optional(),
  })
  .superRefine((data, ctx) => {
    if ((data.openingBalance ?? 0) > 0 && !data.openingBalanceType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Opening balance ka type select karo (Diya / Liya)",
        path: ["openingBalanceType"],
      });
    }
  });

export type CreatePersonFormData = z.infer<typeof createPersonSchema>;

export const updatePersonSchema = createPersonSchema;

export type UpdatePersonFormData = z.infer<typeof updatePersonSchema>;

export const createEntrySchema = z
  .object({
    entryDate: z.string().min(1, "Date zaroori hai"),
    liye: z.number().min(0).optional(),
    diye: z.number().min(0).optional(),
    interestAmount: z.number().min(0).optional(),
    dueDate: z.string().optional(),
    description: z.string().optional(),
  })
  .refine(
    (data) => {
      const hasLiye = (data.liye ?? 0) > 0;
      const hasDiye = (data.diye ?? 0) > 0;
      return (hasLiye || hasDiye) && !(hasLiye && hasDiye);
    },
    {
      message: "Sirf ek field fill karo — Liye ya Diye, dono nahi",
      path: ["liye"],
    },
  );

export type CreateEntryFormData = {
  entryDate: string;
  liye?: number;
  diye?: number;
  interestAmount?: number;
  dueDate?: string;
  description?: string;
};
