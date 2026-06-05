import { apiClient } from "@/lib/axios";
import type {
  DiaryAccount,
  CreateDiaryAccountDto,
  DiaryTransaction,
  DiaryActionDto,
  EditDiaryTransactionDto,
  DiarySummary,
} from "@/types/diary.types";

const BASE = "/diary/accounts";

export const diaryService = {
  getAll: async () => {
    const response = await apiClient.get<DiaryAccount[]>(BASE);
    return response.data;
  },

  getSummary: async (from?: string, to?: string, date?: string) => {
    const params: any = {};
    if (from && to) {
      params.from = from;
      params.to = to;
    } else if (date) {
      params.date = date;
    }
    const response = await apiClient.get<DiarySummary>("/diary/summary", {
      params: Object.keys(params).length ? params : undefined,
    });
    return response.data;
  },

  update: async (id: string, dto: { diaryName: string }) => {
    const response = await apiClient.patch<DiaryAccount>(`${BASE}/${id}`, dto);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<DiaryAccount>(`${BASE}/${id}`);
    return response.data;
  },

  create: async (dto: CreateDiaryAccountDto) => {
    const response = await apiClient.post<DiaryAccount>(BASE, dto);
    return response.data;
  },

  deposit: async (id: string, dto: DiaryActionDto, idempotencyKey?: string) => {
    const config = idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined;
    const response = await apiClient.post<DiaryTransaction>(
      `${BASE}/${id}/deposit`,
      dto,
      config,
    );
    return response.data;
  },

  withdraw: async (
    id: string,
    dto: DiaryActionDto,
    idempotencyKey?: string,
  ) => {
    const config = idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined;
    const response = await apiClient.post<DiaryTransaction>(
      `${BASE}/${id}/withdraw`,
      dto,
      config,
    );
    return response.data;
  },

  postInterest: async (
    id: string,
    dto: DiaryActionDto,
    idempotencyKey?: string,
  ) => {
    const config = idempotencyKey
      ? { headers: { "Idempotency-Key": idempotencyKey } }
      : undefined;
    const response = await apiClient.post<DiaryTransaction>(
      `${BASE}/${id}/interest`,
      dto,
      config,
    );
    return response.data;
  },

  getTransactions: async (id: string) => {
    const response = await apiClient.get<DiaryTransaction[]>(
      `${BASE}/${id}/transactions`,
    );
    return response.data;
  },

  /**
   * ADMIN ONLY — Edit an existing diary transaction.
   * Only send fields that changed; `type` cannot be modified.
   */
  editTransaction: async (
    accountId: string,
    txId: string,
    dto: EditDiaryTransactionDto,
  ) => {
    const response = await apiClient.patch<DiaryTransaction>(
      `${BASE}/${accountId}/transactions/${txId}`,
      dto,
    );
    return response.data;
  },

  /**
   * ADMIN ONLY — Permanently delete a diary transaction.
   * Backend will auto-recalculate all subsequent balances.
   */
  deleteTransaction: async (accountId: string, txId: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `${BASE}/${accountId}/transactions/${txId}`,
    );
    return response.data;
  },

  /**
   * ADMIN ONLY — Permanently delete a diary account.
   * Backend will remove the account and related resources.
   */
  deleteAccount: async (accountId: string) => {
    const response = await apiClient.delete<{ message: string }>(
      `${BASE}/${accountId}`,
    );
    return response.data;
  },

  searchPersons: async (
    q: string,
  ): Promise<Array<{ id: string; name: string; customerCode?: string }>> => {
    const response = await apiClient.get<
      Array<{ id: string; name: string; customerCode?: string }>
    >("/users/customers/search", { params: { q } });
    return response.data;
  },
};
