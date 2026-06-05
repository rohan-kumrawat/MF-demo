export interface VaultCard {
  id: string;
  centreId: string;
  adminId: string;
  bankName: string;
  cardNumber: string;
  cvv: string | null;
  expDate: string | null;
  billGenerateDate: string | null;
  dueDate: string | null;
  billAmount: number | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VaultCredential {
  id: string;
  centreId: string;
  adminId: string;
  companyName: string;
  loginId: string | null;
  password?: string | null;
  pinNumber?: string | null;
  loginPassword?: string | null;
  transactionPassword?: string | null;
  remarks: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VaultPinStatus {
  hasPin: boolean;
}
