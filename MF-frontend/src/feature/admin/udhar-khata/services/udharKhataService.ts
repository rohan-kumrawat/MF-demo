// src/services/admin/udhar-khata.service.ts
import { apiClient } from "@/lib/axios";
import type {
  UdharPerson,
  UdharEntry,
  CreateUdharPersonDto,
  CreateUdharEntryDto,
  UpdateUdharPersonDto,
} from "../types";

const BASE = "/udhar-khata";

export const udharKhataService = {
  getPersons: async () => {
    const response = await apiClient.get<UdharPerson[]>(`${BASE}/persons`);
    return response.data;
  },

  addPerson: async (dto: CreateUdharPersonDto) => {
    const response = await apiClient.post<UdharPerson>(`${BASE}/persons`, dto);
    return response.data;
  },

  updatePerson: async (id: string, dto: UpdateUdharPersonDto) => {
    const response = await apiClient.patch<UdharPerson>(
      `${BASE}/persons/${id}`,
      dto,
    );
    return response.data;
  },

  getEntries: async (personId: string) => {
    const response = await apiClient.get<UdharEntry[]>(
      `${BASE}/persons/${personId}/entries`,
    );
    return response.data;
  },

  addEntry: async (personId: string, dto: CreateUdharEntryDto) => {
    const response = await apiClient.post<UdharEntry>(
      `${BASE}/persons/${personId}/entries`,
      dto,
    );
    return response.data;
  },

  updateEntry: async (id: string, dto: Partial<CreateUdharEntryDto>) => {
    const response = await apiClient.patch<UdharEntry>(
      `${BASE}/entries/${id}`,
      dto,
    );
    return response.data;
  },

  deleteEntry: async (id: string) => {
    const response = await apiClient.delete(`${BASE}/entries/${id}`);
    return response.data;
  },

  deletePerson: async (id: string) => {
    const response = await apiClient.delete(`${BASE}/persons/${id}`);
    return response.data;
  },
};
