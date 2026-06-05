import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { apiClient } from "@/lib/axios";
import type { Customer } from "../types"; // using Customer type since Agent is basically same User shape
import type { PaginatedResponse } from "@/types/user.types";

export function useAgents() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Customer>>(
        "/users",
        {
          params: { role: "agent" },
        },
      );
      return response.data.data;
    },
    enabled: hasHydrated,
  });
}
