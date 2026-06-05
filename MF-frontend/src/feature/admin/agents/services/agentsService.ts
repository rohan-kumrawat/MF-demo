import { apiClient } from "@/lib/axios";
import type { Agent, CreateAgentDto, UpdateAgentDto } from "../types";
import type { PaginatedResponse } from "@/types/user.types";

const BASE = "/users";

export const agentsService = {
  getAgents: async (): Promise<Agent[]> => {
    const response = await apiClient.get<PaginatedResponse<Agent>>(BASE, {
      params: { role: "agent" },
    });
    // Backend now paginates /users — unwrap envelope then filter defensively
    return response.data.data.filter((user) => user.role === "agent");
  },

  getAgent: async (id: string): Promise<Agent> => {
    const response = await apiClient.get<Agent>(`${BASE}/${id}`);
    return response.data;
  },

  createAgent: async (dto: CreateAgentDto): Promise<Agent> => {
    const response = await apiClient.post<Agent>(BASE, dto);
    return response.data;
  },

  updateAgent: async (id: string, dto: UpdateAgentDto): Promise<Agent> => {
    const response = await apiClient.patch<Agent>(`${BASE}/${id}`, dto);
    return response.data;
  },

  deleteAgent: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
