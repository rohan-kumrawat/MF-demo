import { Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface DeleteLoanModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
  loanAccountNumber?: string;
}

export function DeleteLoanModal({
  open,
  onClose,
  onConfirm,
  isPending,
  loanAccountNumber,
}: DeleteLoanModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Delete Loan
          </DialogTitle>
          <DialogDescription className="pt-3 pb-2 text-slate-600 leading-relaxed">
            Are you absolutely sure you want to delete loan{" "}
            <strong className="text-slate-900">{loanAccountNumber}</strong>?
            <br />
            <br />
            This action is <strong>irreversible</strong> and will permanently
            remove the loan and all associated transactions from the system.
            Linked diary deductions will be refunded.
            <br />
            <br />
            <span className="text-destructive/90 font-medium">
              क्या आप वाकई इस लोन को डिलीट करना चाहते हैं? यह कार्रवाई{" "}
              <strong>अपरिवर्तनीय</strong> है और लोन तथा उससे जुड़े सभी लेनदेन
              को सिस्टम से हमेशा के लिए हटा देगी।
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Yes, Delete Loan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
