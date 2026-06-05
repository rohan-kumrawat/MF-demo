import { apiClient } from "@/lib/axios";

export type CustomerFileRecord = {
  id: string;
  customerId: string;
  loanId: string | null;
  centreId: string;
  originalFileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  documentType: string | null;
  description: string | null;
  uploadedAt: string;
};

export const customerFilesService = {
  async getCustomerFiles(_customerId: string, loanId?: string) {
    const response = await apiClient.get<{
      success: boolean;
      data: CustomerFileRecord[];
    }>("/files/customer/my-files", {
      params: loanId ? { loanId } : undefined,
    });

    return response.data.data;
  },

  async uploadLoanFiles(params: {
    customerId: string;
    loanId: string;
    files: File[];
    documentType: string;
    description?: string;
  }) {
    const formData = new FormData();

    for (const file of params.files) {
      formData.append("files", file);
    }
    formData.append("customerId", params.customerId);
    formData.append("loanId", params.loanId);
    formData.append("documentType", params.documentType);
    if (params.description) {
      formData.append("description", params.description);
    }

    const response = await apiClient.post<{
      success: boolean;
      data: CustomerFileRecord[];
    }>("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },
};
