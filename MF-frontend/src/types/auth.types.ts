// src/types/auth.types.ts

export interface User {
  id: string;
  username: string;
  role: "admin" | "agent" | "customer" | "kiosk";
  centreId: string;
  name?: string;
  phone?: string;
  address?: string;
  aadharNumber?: string;
  fatherHusbandName?: string;
  memberSince?: string;
  diaryIds?: string[];
  loanIds?: string[];
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}
