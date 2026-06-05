import { apiClient } from "@/lib/axios";
import type {
  LoginResponse,
  LoginCredentials,
  ChangePasswordDto,
} from "@/types/auth.types";

const BASE = "/auth";

export const authService = {
  login: async (credentials: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>(
      `${BASE}/login`,
      credentials,
    );
    return response.data;
  },

  refresh: async (refreshToken: string) => {
    const response = await apiClient.post<LoginResponse>(`${BASE}/refresh`, {
      refreshToken,
    });
    return response.data;
  },

  logout: async (refreshToken: string) => {
    const response = await apiClient.post(`${BASE}/logout`, { refreshToken });
    return response.data;
  },

  changePassword: async (dto: ChangePasswordDto) => {
    const response = await apiClient.post(`${BASE}/change-password`, dto);
    return response.data;
  },

  resetPassword: async (userId: string, newPassword: string) => {
    const response = await apiClient.post(`${BASE}/reset-password/${userId}`, {
      newPassword,
    });
    return response.data;
  },

  forgotPassword: async (identifier: string) => {
    const response = await apiClient.post(`${BASE}/forgot-password`, {
      identifier,
    });
    return response.data;
  },

  resetPasswordWithOtp: async (data: {
    identifier: string;
    otp: string;
    newPassword: string;
  }) => {
    const response = await apiClient.post(`${BASE}/reset-password-otp`, data);
    return response.data;
  },
};
