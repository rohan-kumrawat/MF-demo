// src/types/daily-register.types.ts

export interface DayRegister {
  id: string;
  centreId: string;
  entryDate: string;
  openingBalance: number;
  closingBalance: number;
  createdBy: string;
  createdAt: string;
}

export type UpiOption =
  | "PHONE_PAY"
  | "GOOGLE_PAY"
  | "PAYTM"
  | "BHIM_UPI"
  | "OTHER"
  | "BUSINESS_QR";

export interface RegisterEntry {
  id: string;
  registerDayId: string;
  upi?: UpiOption;
  withdraw: number;
  deposit: number;
  payIn: number;
  payOut: number;
  recharge: number;
  commission: number;
  addAmount: number;
  balanceAfter: number;
  remark?: string;
  entryTime: string;
  createdBy: string;
  createdAt: string;
}

export interface CreateDayDto {
  entryDate: string;
  openingBalance: number;
}

export interface CreateEntryDto {
  upi?: UpiOption;
  withdraw?: number;
  deposit?: number;
  payIn?: number;
  payOut?: number;
  recharge?: number;
  commission?: number;
  addAmount?: number;
  remark?: string;
  entryTime?: string;
}
