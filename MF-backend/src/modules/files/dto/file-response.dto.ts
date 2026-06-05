export class FileResponseDto {
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
  uploadedAt: Date;
}
