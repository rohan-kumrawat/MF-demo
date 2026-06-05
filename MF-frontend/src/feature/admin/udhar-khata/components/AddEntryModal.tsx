import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createEntrySchema, type CreateEntryFormData } from "../schemas";
import type {
  CreateUdharEntryDto,
  UdharPerson,
  UdharDisplayEntry,
} from "../types";
import { localToday } from "@/lib/utils";
import { ModalShortcutsMount } from "../../../../hooks/useKeyboardShortcuts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { DatePickerField } from "@/components/ui/date-picker-field";

interface Props {
  khatedar: UdharPerson | null;
  initialData?: UdharDisplayEntry | null;
  onSave: (khatedarId: string, dto: CreateUdharEntryDto) => Promise<void>;
  onClose: () => void;
  isPending?: boolean;
}

export function AddEntryModal({
  khatedar,
  initialData,
  onSave,
  onClose,
  isPending,
}: Props) {
  const isEdit = !!initialData;

  const form = useForm<CreateEntryFormData>({
    resolver: zodResolver(createEntrySchema),
    defaultValues: {
      entryDate: localToday(),
      liye: 0,
      diye: 0,
      interestAmount: undefined,
      dueDate: undefined,
      description: "",
    },
  });

  const { reset, setError, handleSubmit } = form;

  // Reset form when modal opens/closes or khatedar/initialData changes
  useEffect(() => {
    if (khatedar) {
      if (initialData) {
        reset({
          entryDate: initialData.date,
          liye: initialData.liye || 0,
          diye: initialData.diye || 0,
          interestAmount: initialData.interestAmount ?? undefined,
          dueDate: initialData.dueDate ?? undefined,
          description: initialData.remark || "",
        });
      } else {
        reset({
          entryDate: localToday(),
          liye: 0,
          diye: 0,
          interestAmount: undefined,
          dueDate: undefined,
          description: "",
        });
      }
    } else {
      reset();
    }
  }, [khatedar, initialData, reset]);

  const onSubmit = async (data: CreateEntryFormData) => {
    if (!khatedar) return;

    const isLiya = (data.liye ?? 0) > 0;
    try {
      await onSave(khatedar.id, {
        entryDate: data.entryDate,
        entryType: isLiya ? "liya" : "diya",
        amount: isLiya ? data.liye! : data.diye!,
        interestAmount: data.interestAmount,
        dueDate: data.dueDate,
        remark: data.description || "",
      });
      onClose();
    } catch (error: any) {
      // API Error Mapping
      if (error?.response?.data?.errors) {
        error.response.data.errors.forEach((err: any) => {
          let fieldName = err.field;
          if (fieldName === "amount") {
            fieldName = (data.liye ?? 0) > 0 ? "liye" : "diye";
          }
          if (fieldName === "remark") fieldName = "description";
          if (fieldName === "entryDate") fieldName = "entryDate";

          setError(fieldName as keyof CreateEntryFormData, {
            type: "server",
            message: err.message,
          });
        });
      }
    }
  };

  return (
    <Dialog open={!!khatedar} onOpenChange={(open) => !open && onClose()}>
      <ModalShortcutsMount
        modalId="udhar-khata-entry-modal"
        shortcuts={[
          {
            key: "Escape",
            description: "Close modal",
            action: onClose,
            allowInInput: true,
          },
          {
            key: "s",
            altKey: true,
            description: "Save entry",
            action: handleSubmit(onSubmit),
            allowInInput: true,
          },
        ]}
      />
      <DialogContent className="max-w-sm p-6 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">
            {isEdit ? "Update Entry" : "Add Entry"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {khatedar?.name} ke liye entry save karein.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Date
                    </FormLabel>
                    <FormControl>
                      <DatePickerField
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold">
                      Due Date
                    </FormLabel>
                    <FormControl>
                      <DatePickerField
                        value={field.value || ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="liye"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-green-600">
                      Liye (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="diye"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-destructive">
                      Diye (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(e.target.valueAsNumber)}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px]" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="interestAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    Interest Amount (₹)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    Remark
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Transaction details..." {...field} />
                  </FormControl>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />

            <div className="flex gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending && <Spinner className="size-4" />}
                {isPending
                  ? "Saving..."
                  : isEdit
                    ? "Update Entry"
                    : "Save Entry"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
