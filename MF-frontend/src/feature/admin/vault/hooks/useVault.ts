import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import type { VaultCard, VaultCredential, VaultPinStatus } from "../types";

// --- PIN Management ---

export function useVaultPinStatus() {
  return useQuery({
    queryKey: ["vault", "pinStatus"],
    queryFn: async () => {
      const { data } = await apiClient.get<VaultPinStatus>("/vault/pin-status");
      return data;
    },
  });
}

export function useSetupVaultPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (pin: string) => {
      const { data } = await apiClient.post("/vault/setup-pin", { pin });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "pinStatus"] });
    },
  });
}

export function useVerifyVaultPin() {
  return useMutation({
    mutationFn: async (pin: string) => {
      const { data } = await apiClient.post("/vault/verify-pin", { pin });
      return data;
    },
  });
}

export function useResetVaultPin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      password,
      newPin,
    }: {
      password: string;
      newPin: string;
    }) => {
      const { data } = await apiClient.post("/vault/reset-pin", {
        password,
        newPin,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "pinStatus"] });
    },
  });
}

// --- Cards ---

export function useVaultCards(isUnlocked: boolean) {
  return useQuery({
    queryKey: ["vault", "cards"],
    queryFn: async () => {
      const { data } = await apiClient.get<VaultCard[]>("/vault/cards");
      return data;
    },
    enabled: isUnlocked,
  });
}

export function useCreateVaultCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (card: Partial<VaultCard>) => {
      const { data } = await apiClient.post<VaultCard>("/vault/cards", card);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "cards"] });
    },
  });
}

export function useUpdateVaultCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VaultCard>;
    }) => {
      const { data: resData } = await apiClient.patch<VaultCard>(
        `/vault/cards/${id}`,
        data,
      );
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "cards"] });
    },
  });
}

export function useDeleteVaultCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/vault/cards/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "cards"] });
    },
  });
}

// --- Credentials ---

export function useVaultCredentials(isUnlocked: boolean) {
  return useQuery({
    queryKey: ["vault", "credentials"],
    queryFn: async () => {
      const { data } =
        await apiClient.get<VaultCredential[]>("/vault/credentials");
      return data;
    },
    enabled: isUnlocked,
  });
}

export function useCreateVaultCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credential: Partial<VaultCredential>) => {
      const { data } = await apiClient.post<VaultCredential>(
        "/vault/credentials",
        credential,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "credentials"] });
    },
  });
}

export function useUpdateVaultCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<VaultCredential>;
    }) => {
      const { data: resData } = await apiClient.patch<VaultCredential>(
        `/vault/credentials/${id}`,
        data,
      );
      return resData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "credentials"] });
    },
  });
}

export function useDeleteVaultCredential() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/vault/credentials/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vault", "credentials"] });
    },
  });
}
