// src/feature/admin/kiosk-users/types.ts
export interface KioskUser {
  id: string;
  centreId: string | null;
  username: string;
  role: "admin" | "agent" | "customer" | "kiosk";
  name: string;
  phone: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateKioskUserDto {
  username: string;
  password?: string;
  role: "kiosk";
  name: string;
  phone: string;
  address?: string;
}

export interface UpdateKioskUserDto {
  name?: string;
  phone?: string;
  address?: string;
  password?: string;
}
