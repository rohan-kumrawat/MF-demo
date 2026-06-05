import { apiClient } from "@/lib/axios";
import type { User, CreateUserDto, UpdateUserDto } from "@/types/user.types";
import type { PaginatedResponse } from "@/types/user.types";

const BASE = "/users";

export const usersService = {
  getAll: async () => {
    const response = await apiClient.get<PaginatedResponse<User>>(BASE);
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<User>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (dto: CreateUserDto) => {
    const response = await apiClient.post<User>(BASE, dto);
    return response.data;
  },

  update: async (id: string, dto: UpdateUserDto) => {
    const response = await apiClient.patch<User>(`${BASE}/${id}`, dto);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${BASE}/${id}`);
    return response.data;
  },
};
