import { apiClient } from "@/lib/axios";
import type {
  Customer,
  CreateCustomerDto,
  CustomerFilters,
} from "@/types/customer.types";
import type { PaginatedResponse } from "@/types/user.types";

const BASE = "/users"; // Based on api_reference.md, customers are managed via /users

export const customersService = {
  getAll: async (params?: CustomerFilters) => {
    const response = await apiClient.get<PaginatedResponse<Customer>>(BASE, {
      params: { ...params, role: "customer" },
    });
    // Unwrap paginated envelope — consumers receive a plain Customer[]
    return response.data.data;
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

  search: async (query: string) => {
    const response = await apiClient.get<{ id: string; name: string }[]>(
      `${BASE}/customers/search`,
      {
        params: { q: query },
      },
    );
    return response.data;
  },
};
