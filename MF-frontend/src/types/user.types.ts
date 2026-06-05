// src/types/user.types.ts
import type { User } from "./auth.types";

/** Generic wrapper for all paginated API responses from GET /users */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserDto {
  username: string;
  password?: string;
  role: "admin" | "agent" | "customer" | "kiosk";
  name: string;
  phone: string;
  address?: string;
  aadharNumber?: string;
  fatherHusbandName?: string;
  memberSince?: string;
  /** Customer nominee details (optional) */
  nomineeName?: string;
  nomineeRelation?: string;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  address?: string;
  fatherHusbandName?: string;
  memberSince?: string;
}

export type { User };
