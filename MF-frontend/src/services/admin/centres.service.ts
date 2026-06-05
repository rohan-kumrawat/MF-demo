import { apiClient } from "@/lib/axios";
import type { Centre } from "@/types/centre.types";

const BASE = "/centres";

export const centresService = {
  getAll: async () => {
    const response = await apiClient.get<Centre[]>(BASE);
    return response.data;
  },
};
