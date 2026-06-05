// src/feature/admin/customers/types.ts

export interface Customer {
  id: string;
  username: string;
  role: "customer";
  name: string;
  phone: string;
  address: string;
  aadharNumber?: string;
  fatherHusbandName: string;
  memberSince: string;
  centreId: string;
  createdAt: string;
  updatedAt?: string;

  // Unique code assigned by backend
  customerCode?: string;
  /** Nominee details */
  nomineeName?: string;
  nomineeRelation?: string;

  // Frontend extended properties for list view (these should map from API)
  accountNo?: string;
  diaryBalance?: number;
  activeLoan?: number;
  risk?: string;
  emiStatus?: string;
  agentId?: string;
}

export interface CreateCustomerDto {
  username: string;
  password?: string;
  role: "customer";
  name: string;
  phone: string;
  address: string;
  aadharNumber?: string;
  fatherHusbandName: string;
  memberSince: string;
  /** Nominee details — include only when creating or explicitly updating */
  nomineeName?: string;
  nomineeRelation?: string;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  name?: string;
  centreId?: string;
  status?: string;
  risk?: string;
  agent?: string;
}

// ── Diary Accounts ──────────────────────────────────────────────

export interface DiaryAccountCustomer {
  id: string;
  name: string;
  phone: string;
  customerCode: string;
}

export interface DiaryAccount {
  id: string;
  centreId: string;
  customerId: string;
  diaryName: string;
  balance: string;
  cycleStartDate: string;
  lastWithdrawalDate: string | null;
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  accountCode?: string;
  customer: DiaryAccountCustomer;
}
