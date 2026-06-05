import { z } from "zod";

export const createCustomerSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .transform((v) => v.toLowerCase().replace(/\s+/g, ""))
    .refine(
      (v) => /^[a-z0-9._]+$/.test(v),
      "Username can only contain lowercase letters, numbers, dots and underscores",
    ),
  password: z.string().optional().or(z.literal("")),
  name: z.string().min(1, "Name is required"),
  phone: z.string().regex(/^\d{10}$/, "Phone must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  aadharNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^\d{12}$/.test(val),
      "Aadhar number must be exactly 12 digits",
    ),
  fatherHusbandName: z.string().min(1, "Father/Husband name is required"),
  memberSince: z.string().min(1, "Member since date is required"),
  /** Nominee details — optional at create time */
  nomineeName: z
    .string()
    .min(1, "Nominee name is required")
    .optional()
    .or(z.literal("")),
  nomineeRelation: z
    .string()
    .min(1, "Nominee relation is required")
    .optional()
    .or(z.literal("")),
});

export type CreateCustomerFormData = z.infer<typeof createCustomerSchema>;

/**
 * PATCH update schema — only send fields the user actually changed.
 * All fields optional. Backend ignores undefined keys.
 */
export const updateCustomerSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  phone: z
    .string()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits")
    .optional(),
  address: z.string().min(1, "Address is required").optional(),
  aadharNumber: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (val) => !val || /^\d{12}$/.test(val),
      "Aadhar number must be exactly 12 digits",
    ),
  fatherHusbandName: z
    .string()
    .min(1, "Father/Husband name is required")
    .optional(),
  memberSince: z.string().min(1, "Member since date is required").optional(),
  nomineeName: z.string().optional().or(z.literal("")),
  nomineeRelation: z.string().optional().or(z.literal("")),
  username: z
    .string()
    .transform((v) => v.toLowerCase().replace(/\s+/g, ""))
    .refine(
      (v) => !v || /^[a-z0-9._]+$/.test(v),
      "Username can only contain lowercase letters, numbers, dots and underscores",
    )
    .optional()
    .or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
});

export type UpdateCustomerFormData = z.infer<typeof updateCustomerSchema>;
