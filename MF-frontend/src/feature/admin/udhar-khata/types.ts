// src/feature/admin/udhar-khata/types.ts

export interface UdharPerson {
  id: string;
  centreId: string;
  name: string;
  phone: string;
  address: string | null;
  netBalance: string; // API returns string ("1000.00")
  openingBalance?: string;
  openingBalanceType?: "diya" | "liya";
  /** Unique code assigned by backend (e.g. KCSC-UK00001) */
  personCode?: string;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface UdharEntry {
  id: string;
  personId: string;
  entryType: "liya" | "diya";
  amount: number;
  interestAmount?: number | null;
  dueDate?: string | null;
  remark: string;
  entryDate: string;
  createdAt: string;
}

export interface CreateUdharPersonDto {
  name: string;
  phone: string;
  address: string;
  /**
   * Optional opening balance amount.
   * Must be paired with openingBalanceType when > 0.
   */
  openingBalance?: number;
  /**
   * "diya" = we gave them money (positive netBalance)
   * "liya" = they owe us money (negative netBalance)
   */
  openingBalanceType?: "diya" | "liya";
}

export interface CreateUdharEntryDto {
  entryType: "liya" | "diya";
  amount: number;
  interestAmount?: number;
  dueDate?: string;
  remark: string;
  entryDate: string;
}

export interface UpdateUdharPersonDto {
  name: string;
  phone: string;
  address: string;
}

export interface UdharPersonWithEntries extends UdharPerson {
  entries: UdharEntry[];
}

export interface KhataSummary {
  totalLena: number;
  totalDena: number;
  netPos: number;
  totalKhatedars: number;
  activeKhatedars: number;
  inactiveKhatedars: number;
}

export interface UdharDisplayEntry {
  id: string;
  date: string;
  liye: number | null;
  diye: number | null;
  interestAmount: number | null;
  dueDate: string | null;
  balance: number;
  remark: string;
}
