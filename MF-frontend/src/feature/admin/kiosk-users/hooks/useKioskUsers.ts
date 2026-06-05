// src/feature/admin/kiosk-users/hooks/useKioskUsers.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { kioskUsersService } from "../services/kioskUsersService";
import type { UpdateKioskUserDto } from "../types";

export function useKioskUsers() {
  const queryClient = useQueryClient();

  const {
    data: kioskUsers = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["kiosk-users"],
    queryFn: kioskUsersService.getKioskUsers,
  });

  const createKioskUserMutation = useMutation({
    mutationFn: kioskUsersService.createKioskUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosk-users"] });
    },
  });

  const updateKioskUserMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateKioskUserDto }) =>
      kioskUsersService.updateKioskUser(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosk-users"] });
    },
  });

  const deleteKioskUserMutation = useMutation({
    mutationFn: kioskUsersService.deleteKioskUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kiosk-users"] });
    },
  });

  return {
    kioskUsers,
    isLoading,
    error,
    createKioskUser: createKioskUserMutation.mutateAsync,
    updateKioskUser: updateKioskUserMutation.mutateAsync,
    deleteKioskUser: deleteKioskUserMutation.mutateAsync,
    isCreating: createKioskUserMutation.isPending,
    isUpdating: updateKioskUserMutation.isPending,
    isDeleting: deleteKioskUserMutation.isPending,
  };
}
