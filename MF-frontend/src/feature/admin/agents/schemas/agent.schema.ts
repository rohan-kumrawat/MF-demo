// src/feature/admin/agents/schemas/agent.schema.ts
import * as z from "zod";

export const agentSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().optional(),
});

export type AgentFormData = z.infer<typeof agentSchema>;
