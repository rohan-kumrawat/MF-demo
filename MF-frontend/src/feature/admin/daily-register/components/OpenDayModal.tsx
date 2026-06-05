// src/feature/admin/daily-register/components/OpenDayModal.tsx
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Calendar } from "lucide-react";
import {
  createDaySchema,
  type CreateDayFormData,
} from "../schemas/daily-register.schema";
import type { CreateDayDto } from "../types";
import { localToday } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dto: CreateDayDto) => void;
  isPending?: boolean;
  defaultEntryDate?: string;
  defaultOpeningBalance?: number;
}

export function OpenDayModal({
  open,
  onClose,
  onSave,
  isPending,
  defaultEntryDate,
  defaultOpeningBalance,
}: Props) {
  const form = useForm<CreateDayFormData>({
    resolver: zodResolver(createDaySchema),
    defaultValues: {
      entryDate: defaultEntryDate ?? localToday(),
      openingBalance: defaultOpeningBalance ?? 0,
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      entryDate: defaultEntryDate ?? localToday(),
      openingBalance: defaultOpeningBalance ?? 0,
    });
  }, [defaultEntryDate, defaultOpeningBalance, form, open]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = (data: CreateDayFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#005eb0]" />
            Open New Day Register
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 pt-2"
          >
            <FormField
              control={form.control}
              name="entryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Register Date</FormLabel>
                  <FormControl>
                    <DatePickerField
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opening Balance</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === "" ? 0 : Number(e.target.value),
                        )
                      }
                      placeholder="Enter opening balance"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Open Day
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
