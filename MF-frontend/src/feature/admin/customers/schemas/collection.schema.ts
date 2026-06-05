import { z } from "zod";

export const collectEmiSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1"),
  mode: z.enum(["Cash", "UPI", "Cheque"]),
  useDiary: z.boolean(),
});

export type CollectEmiFormData = z.infer<typeof collectEmiSchema>;
