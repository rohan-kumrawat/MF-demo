// src/types/customer.types.ts

export interface Customer {
  id: string;
  username: string;
  role: "customer";
  name: string;
  phone: string;
  address: string;
  aadharNumber: string;
  fatherHusbandName: string;
  memberSince: string;
  centreId: string;
  createdAt: string;
  updatedAt?: string;
  /** Unique code assigned by backend (e.g. CTST-00001) */
  customerCode?: string;
  /** Nominee details */
  nomineeName?: string;
  nomineeRelation?: string;
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
  centreId?: string;
}
