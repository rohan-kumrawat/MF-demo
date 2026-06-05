// src/feature/admin/customers/services/customersService.ts
import { apiClient } from "@/lib/axios";
import type {
  Customer,
  CreateCustomerDto,
  CustomerFilters,
  DiaryAccount,
} from "../types";
import type { PaginatedResponse } from "@/types/user.types";

const BASE = "/users"; // Based on api_reference.md, customers are managed via /users

export const customersService = {
  getAll: async (
    params?: CustomerFilters,
  ): Promise<PaginatedResponse<Customer>> => {
    const response = await apiClient.get<PaginatedResponse<Customer>>(BASE, {
      params: { ...params, role: "customer" },
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<Customer>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (dto: CreateCustomerDto) => {
    const response = await apiClient.post<Customer>(BASE, {
      ...dto,
      role: "customer",
    });
    return response.data;
  },

  update: async (id: string, dto: Partial<CreateCustomerDto>) => {
    const response = await apiClient.patch<Customer>(`${BASE}/${id}`, dto);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`${BASE}/${id}`);
    return response.data;
  },

  /** GET /diary/customers/:customerId/accounts */
  getCustomerDiaryAccounts: async (
    customerId: string,
  ): Promise<DiaryAccount[]> => {
    const response = await apiClient.get<DiaryAccount[]>(
      `/diary/customers/${customerId}/accounts`,
    );
    return response.data;
  },
};
