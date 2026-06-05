// src/feature/admin/kiosk-users/services/kioskUsersService.ts
import { apiClient } from "@/lib/axios";
import type {
  KioskUser,
  CreateKioskUserDto,
  UpdateKioskUserDto,
} from "../types";
import type { PaginatedResponse } from "@/types/user.types";

const BASE = "/users";

export const kioskUsersService = {
  getKioskUsers: async (): Promise<KioskUser[]> => {
    const response = await apiClient.get<PaginatedResponse<KioskUser>>(BASE, {
      params: { role: "kiosk" },
    });
    // Backend now paginates /users — unwrap envelope then filter defensively
    return response.data.data.filter((user) => user.role === "kiosk");
  },

  getKioskUser: async (id: string): Promise<KioskUser> => {
    const response = await apiClient.get<KioskUser>(`${BASE}/${id}`);
    return response.data;
  },

  createKioskUser: async (dto: CreateKioskUserDto): Promise<KioskUser> => {
    const response = await apiClient.post<KioskUser>(BASE, dto);
    return response.data;
  },

  updateKioskUser: async (
    id: string,
    dto: UpdateKioskUserDto,
  ): Promise<KioskUser> => {
    const response = await apiClient.patch<KioskUser>(`${BASE}/${id}`, dto);
    return response.data;
  },

  deleteKioskUser: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
