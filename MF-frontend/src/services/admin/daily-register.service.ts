import { apiClient } from "@/lib/axios";
import type {
  DayRegister,
  RegisterEntry,
  CreateDayDto,
  CreateEntryDto,
} from "@/types/daily-register.types";

const BASE = "/daily-register";

export const dailyRegisterService = {
  getDays: async () => {
    const response = await apiClient.get<DayRegister[]>(`${BASE}/days`);
    return response.data;
  },

  openDay: async (dto: CreateDayDto) => {
    const response = await apiClient.post<DayRegister>(`${BASE}/days`, dto);
    return response.data;
  },

  getEntries: async (dayId: string) => {
    const response = await apiClient.get<RegisterEntry[]>(
      `${BASE}/days/${dayId}/entries`,
    );
    return response.data;
  },

  addEntry: async (dayId: string, dto: CreateEntryDto) => {
    const response = await apiClient.post<RegisterEntry>(
      `${BASE}/days/${dayId}/entries`,
      dto,
    );
    return response.data;
  },

  updateEntry: async (id: string, dto: Partial<CreateEntryDto>) => {
    const response = await apiClient.patch<RegisterEntry>(
      `${BASE}/entries/${id}`,
      dto,
    );
    return response.data;
  },

  deleteEntry: async (id: string) => {
    const response = await apiClient.delete(`${BASE}/entries/${id}`);
    return response.data;
  },
};
