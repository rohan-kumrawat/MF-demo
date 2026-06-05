import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPersonSchema, type CreatePersonFormData } from "../schemas";
import {
  type CreateUdharPersonDto,
  type UpdateUdharPersonDto,
  type UdharPerson,
} from "../types";
import { AxiosError } from "axios";
import { ModalShortcutsMount } from "../../../../hooks/useKeyboardShortcuts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";

interface Props {
  open: boolean;
  onSave: (dto: any) => Promise<void> | void;
  onClose: () => void;
  isPending?: boolean;
  initialData?: UdharPerson | null;
}

export function AddKhatedarModal({
  open,
  onSave,
  onClose,
  isPending,
  initialData,
}: Props) {
  const isEdit = !!initialData;

  const form = useForm<CreatePersonFormData>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      openingBalance: 0,
      openingBalanceType: "diya",
    },
  });

  // Reset form when modal opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          phone: initialData.phone || "",
          address: initialData.address || "",
          openingBalance: Number(initialData.openingBalance) || 0,
          openingBalanceType: initialData.openingBalanceType || "diya",
        });
      } else {
        form.reset({
          name: "",
          phone: "",
          address: "",
          openingBalance: 0,
          openingBalanceType: "diya",
        });
      }
    }
  }, [open, initialData, form]);

  const onSubmit = async (data: CreatePersonFormData) => {
    const commonFields = {
      name: data.name.trim(),
      phone: data.phone?.trim() || "",
      address: data.address?.trim() || "",
      openingBalance: data.openingBalance || 0,
      openingBalanceType:
        (data.openingBalance ?? 0) > 0 ? data.openingBalanceType : undefined,
    };

    try {
      if (isEdit) {
        const { openingBalance, openingBalanceType, ...updateDto } =
          commonFields;
        await onSave(updateDto as UpdateUdharPersonDto);
      } else {
        const createDto: CreateUdharPersonDto = commonFields;
        await onSave(createDto);
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 400) {
        const validationErrors = error.response.data?.errors;
        if (Array.isArray(validationErrors)) {
          validationErrors.forEach((err: any) => {
            if (err.field && err.message) {
              form.setError(err.field as any, {
                type: "manual",
                message: err.message,
              });
            }
          });
          return; // Stop here if we handled validation errors
        }
      }
      throw error; // Re-throw for other errors (500, network, etc.)
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
        <ModalShortcutsMount
          modalId="udhar-khata-add-person"
          shortcuts={[
            {
              key: "s",
              altKey: true,
              description: isEdit ? "Update khatedar" : "Save khatedar",
              action: form.handleSubmit(onSubmit),
              allowInInput: true,
            },
          ]}
        />
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b">
          <DialogTitle className="text-xl font-bold tracking-tight">
            {isEdit ? "Khatedar Details Edit Karein" : "Naya Khatedar Joden"}
            <span className="block text-xs font-medium text-muted-foreground mt-0.5">
              {isEdit
                ? "Update information for an existing person"
                : "Add a new person to your informal credit ledger"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 py-6 space-y-5"
          >
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                      Naam (Name) *
                    </FormLabel>
                    <FormControl>
                      <Input
                        autoFocus
                        placeholder="Sunil Bhai"
                        className="h-11 rounded-xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-[10px] font-medium" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Phone (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="+91 XXXXX XXXXX"
                          className="h-11 rounded-xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Address (Optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ward 5, Bhoinda"
                          className="h-11 rounded-xl bg-muted/20 border-border/50 focus:bg-background transition-all"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-medium" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                <FormField
                  control={form.control}
                  name="openingBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Opening Balance (₹)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          disabled={isEdit}
                          className="h-11 rounded-xl bg-muted/20 border-border/50 focus:bg-background transition-all disabled:opacity-50"
                          {...field}
                          onChange={(e) =>
                            field.onChange(e.target.valueAsNumber || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-[10px] font-medium" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openingBalanceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
                        Balance Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isEdit}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 py-2 rounded-xl bg-muted w-full border-border/50 focus:bg-background transition-all disabled:opacity-50">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          className="rounded-xl"
                          position="popper"
                          align="start"
                        >
                          <SelectItem value="diya" className="rounded-lg">
                            Maine Diye (I Gave)
                          </SelectItem>
                          <SelectItem value="liya" className="rounded-lg">
                            Maine Liye (I Took)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[10px] font-medium" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Kbd>Alt</Kbd> + <Kbd>S</Kbd> to {isEdit ? "Update" : "Save"}
                </span>
              </div>
              <div className="flex gap-3 w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 sm:flex-none h-11 px-8 rounded-xl font-bold shadow-lg shadow-primary/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isEdit ? "Updating..." : "Saving..."}
                    </>
                  ) : isEdit ? (
                    "Update Details"
                  ) : (
                    "Save Khatedar"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
