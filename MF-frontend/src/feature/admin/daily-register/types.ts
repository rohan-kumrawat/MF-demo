export type {
  DayRegister,
  RegisterEntry,
  CreateDayDto,
  CreateEntryDto,
} from "@/types/daily-register.types";

import type { CreateEntryDto, UpiOption } from "@/types/daily-register.types";

export type FormState = Partial<CreateEntryDto> & {
  timeInput?: string;
  upi?: UpiOption;
  entryDate?: string;
  udharKhata?: { id: string; name: string; amount: number };
  amount?: number;
  entryType?: "liya" | "diya";
};
