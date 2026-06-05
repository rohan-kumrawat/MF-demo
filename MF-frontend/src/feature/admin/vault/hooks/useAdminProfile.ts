import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";

export interface AdminProfile {
  id: string;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  role: string;
}

export function useAdminProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["admin-profile", userId],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProfile>(`/users/${userId}`);
      return data;
    },
    enabled: !!userId,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<AdminProfile>;
    }) => {
      const { data: resData } = await apiClient.patch<AdminProfile>(
        `/users/${id}`,
        data,
      );
      return resData;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-profile", variables.id],
      });
    },
  });
}

export function useChangeAdminPassword() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const { data: resData } = await apiClient.patch(
        `/users/${id}/password`,
        data,
      );
      return resData;
    },
  });
}

export function useRequestEmailOtp() {
  return useMutation({
    mutationFn: async ({ id, newEmail }: { id: string; newEmail: string }) => {
      const { data } = await apiClient.post(`/users/${id}/email/request-otp`, {
        newEmail,
      });
      return data;
    },
  });
}

export function useVerifyEmailOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, otp }: { id: string; otp: string }) => {
      const { data } = await apiClient.post(`/users/${id}/email/verify-otp`, {
        otp,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-profile", variables.id],
      });
    },
  });
}
