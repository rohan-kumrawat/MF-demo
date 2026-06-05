import { useMemo, useRef, useState } from "react";
import { AxiosError } from "axios";
import { Download, FileText, Upload, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import {
  useCustomerLoanFiles,
  useUploadCustomerLoanFiles,
} from "../../hooks/useCustomerDetail";
import type { CustomerLoanSummary } from "@/feature/agent/types";

type LoanDocumentsPanelProps = {
  customerId: string;
  loanSummary?: CustomerLoanSummary;
};

const DOCUMENT_TYPES = [
  { value: "signed_printout", label: "Signed Printout" },
  { value: "kyc_document", label: "KYC / Identity" },
  { value: "supporting_document", label: "Supporting Document" },
  { value: "other", label: "Other" },
];

export function LoanDocumentsPanel({
  customerId,
  loanSummary,
}: LoanDocumentsPanelProps) {
  const loans = loanSummary?.loans || [];
  const defaultLoan = useMemo(
    () => loans.find((loan) => loan.status === "active") || loans[0],
    [loans],
  );
  const [selectedLoanId, setSelectedLoanId] = useState<string | undefined>(
    defaultLoan?.id,
  );
  const [documentType, setDocumentType] = useState("signed_printout");
  const [description, setDescription] = useState(
    "Signed loan application form",
  );
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedLoan = useMemo(
    () => loans.find((loan) => loan.id === selectedLoanId) || defaultLoan,
    [loans, selectedLoanId, defaultLoan],
  );

  const { data: loanFiles = [], isLoading } = useCustomerLoanFiles(
    customerId,
    selectedLoan?.id,
  );
  const uploadMutation = useUploadCustomerLoanFiles(
    customerId,
    selectedLoan?.id,
  );

  const handleUpload = async () => {
    if (!selectedLoan?.id || files.length === 0) return;

    try {
      const uploaded = await uploadMutation.mutateAsync({
        files,
        documentType,
        description,
      });
      setFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast.success(`${uploaded.length} file(s) uploaded successfully.`);
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Array<{ field: string; message: string }>;
      }>;
      const serverFieldError = axiosError.response?.data?.errors?.[0]?.message;
      const serverMessage = axiosError.response?.data?.message;
      toast.error(serverFieldError || serverMessage || "File upload failed.");
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card className="rounded-2xl border-border/50 bg-card shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-primary" />
              Loan Documents
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Upload the signed printout and any extra documents for the
              selected loan.
            </p>
          </div>
          {selectedLoan && (
            <Badge
              variant="outline"
              className="rounded-full font-mono text-[10px] uppercase"
            >
              {selectedLoan.loanAccountNumber}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Select Loan
            </label>
            <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
              <SelectTrigger className="mt-1 rounded-xl w-full">
                <SelectValue placeholder="Choose loan" />
              </SelectTrigger>
              <SelectContent className="w-full" position="popper" align="start">
                {loans.map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    {loan.loanAccountNumber} ·{" "}
                    {formatCurrency(loan.remainingBalance)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Document Type
            </label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger className="mt-1 rounded-xl w-full">
                <SelectValue placeholder="Choose type" />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                {DOCUMENT_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Attach Files
            </label>
            <Input
              ref={fileInputRef}
              type="file"
              multiple
              className="mt-1 rounded-xl"
              onChange={(event) =>
                setFiles(Array.from(event.target.files || []))
              }
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="mt-1 rounded-xl min-h-24"
            placeholder="Signed printout, guarantor ID, address proof, etc."
          />
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">
            {files.length > 0
              ? `${files.length} file(s) ready to upload`
              : "Choose one or more files."}
          </p>
          <Button
            type="button"
            onClick={handleUpload}
            disabled={
              !selectedLoan?.id ||
              files.length === 0 ||
              uploadMutation.isPending
            }
            className="rounded-xl font-bold gap-2"
          >
            <Upload className="w-4 h-4" />
            {uploadMutation.isPending ? "Uploading..." : "Upload to This Loan"}
          </Button>
        </div>
      </Card>

      <Card className="rounded-2xl border-border/50 bg-card shadow-sm p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Uploaded Documents
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Files saved against the selected loan are listed here.
            </p>
          </div>
          <Badge
            variant="secondary"
            className="rounded-full text-[10px] uppercase"
          >
            {loanFiles.length} file(s)
          </Badge>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Loading documents...
          </div>
        ) : loanFiles.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No documents uploaded for this loan yet.
          </div>
        ) : (
          <div className="space-y-3">
            {loanFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-border/50 p-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-foreground">
                      {file.originalFileName}
                    </p>
                    {file.documentType && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase rounded-full"
                      >
                        {file.documentType}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {file.description || "No description"}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    {new Date(file.uploadedAt).toLocaleString()} ·{" "}
                    {(file.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-bold gap-2"
                  onClick={() =>
                    window.open(file.fileUrl, "_blank", "noopener,noreferrer")
                  }
                >
                  <Download className="w-4 h-4" />
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
