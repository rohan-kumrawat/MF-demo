import { useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (notes: string) => void;
  isPending?: boolean;
}

export function ApplyBulletPenaltyModal({
  open,
  onClose,
  onSave,
  isPending,
}: Props) {
  const [notes, setNotes] = useState("");

  const handleClose = () => {
    setNotes("");
    onClose();
  };

  const handleSave = () => {
    onSave(notes);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl shadow-ambient-xl p-0 overflow-hidden border-none animate-slide-up">
        {/* Header */}
        <DialogHeader className="px-5 py-3 border-b border-[#c1c6d5]/20 bg-destructive/5 flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-left">
              <DialogTitle
                className="text-sm font-extrabold text-[#121c28]"
                style={{ fontFamily: "Manrope, sans-serif" }}
              >
                Apply Bullet Penalty
              </DialogTitle>
              <p className="text-[11px] text-[#717784] font-bold">
                Add next month's interest to principal
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-[#43474f]">
              Notes (Optional)
            </Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Customer missed deadline"
              className="h-9 bg-[#f8f9ff] border-[#c3c6d1]/30 rounded-xl focus-visible:ring-destructive/20"
            />
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-4 py-3 border-t border-[#c1c6d5]/20 bg-[#f8f9ff] sm:justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="h-9 px-4 rounded-xl border-[#c3c6d1] text-[#43474f] font-bold hover:bg-white w-1/2"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="h-9 px-4 bg-destructive hover:bg-destructive/90 rounded-xl text-white font-bold shadow-md w-1/2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              "Apply Penalty"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
