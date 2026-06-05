import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { customersService } from "../services/customersService";
import type { CustomerFilters, CreateCustomerDto } from "../types";

export const CUSTOMERS_QUERY_KEY = ["customers"];

export function useCustomers(filters?: CustomerFilters) {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, filters],
    queryFn: () => customersService.getAll(filters),
    placeholderData: (previousData) => previousData, // keep previous data while fetching new (pagination)
    enabled: hasHydrated,
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: [...CUSTOMERS_QUERY_KEY, id],
    queryFn: () => customersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerDto) => customersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateCustomerDto>;
    }) => customersService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: [...CUSTOMERS_QUERY_KEY, variables.id],
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => customersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CUSTOMERS_QUERY_KEY });
    },
  });
}
