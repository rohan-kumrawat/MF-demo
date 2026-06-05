// src/feature/admin/agents/hooks/useAgents.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { agentsService } from "../services/agentsService";
import type { UpdateAgentDto } from "../types";

export function useAgents() {
  const queryClient = useQueryClient();
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  const {
    data: agents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["agents"],
    queryFn: agentsService.getAgents,
    enabled: hasHydrated,
  });

  const createAgentMutation = useMutation({
    mutationFn: agentsService.createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  const updateAgentMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAgentDto }) =>
      agentsService.updateAgent(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  const deleteAgentMutation = useMutation({
    mutationFn: agentsService.deleteAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agents"] });
    },
  });

  return {
    agents,
    isLoading,
    error,
    createAgent: createAgentMutation.mutateAsync,
    updateAgent: updateAgentMutation.mutateAsync,
    deleteAgent: deleteAgentMutation.mutateAsync,
    isCreating: createAgentMutation.isPending,
    isUpdating: updateAgentMutation.isPending,
    isDeleting: deleteAgentMutation.isPending,
  };
}
