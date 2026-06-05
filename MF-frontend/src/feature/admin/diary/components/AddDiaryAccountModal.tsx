import { useEffect, useRef, useMemo } from "react";
import { BookOpen, UserCircle2 } from "lucide-react";
import {
  useCreateDiaryAccount,
  useUpdateDiaryAccount,
} from "../hooks/useDiary";
import type { DiaryAccount } from "../types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDiaryAccountSchema,
  type CreateDiaryAccountFormData,
} from "../schemas/diary.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CustomerSearchCombobox } from "./CustomerSearchCombobox";

interface Props {
  open: boolean;
  onClose: () => void;
  initialData?: DiaryAccount | null;
}

export function AddDiaryAccountModal({ open, onClose, initialData }: Props) {
  // ✅ Ref instead of state — no re-render, no ESLint error
  const customerNameCache = useRef<Record<string, string>>({});

  const createAccount = useCreateDiaryAccount();
  const updateAccount = useUpdateDiaryAccount();
  const isEdit = !!initialData;

  const form = useForm<CreateDiaryAccountFormData>({
    resolver: zodResolver(createDiaryAccountSchema),
    mode: "onChange",
    defaultValues: {
      customerId: "",
      diaryName: "",
      openingBalance: undefined,
    },
  });

  const watchedCustomerId = form.watch("customerId");

  // Derive name — no useState needed
  const selectedCustomerName = useMemo(() => {
    if (!watchedCustomerId) return "";
    if (
      initialData?.customer?.name &&
      watchedCustomerId === initialData.customerId
    ) {
      return initialData.customer.name;
    }
    return customerNameCache.current[watchedCustomerId] ?? "";
  }, [watchedCustomerId, initialData]);

  // Sync logic
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          customerId: initialData.customerId,
          diaryName: initialData.diaryName || "",
          openingBalance: Number(initialData.balance),
        });
      } else {
        form.reset({
          customerId: "",
          diaryName: "",
          openingBalance: undefined,
        });
      }
    }
  }, [open, initialData, form]);
  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit: SubmitHandler<CreateDiaryAccountFormData> = async (
    values,
  ) => {
    try {
      if (isEdit && initialData) {
        await updateAccount.mutateAsync({
          id: initialData.id,
          dto: { diaryName: values.diaryName?.trim() || "" },
        });
      } else {
        await createAccount.mutateAsync({
          customerId: values.customerId,
          diaryName: values.diaryName?.trim() || undefined,
          openingBalance: values.openingBalance || undefined,
        });
      }
      handleClose();
    } catch (err: unknown) {
      // Error handling logic (omitted for brevity, keep your original)
    }
  };

  const isPending = createAccount.isPending || updateAccount.isPending;

  return (
    <Dialog open={open} onOpenChange={(val) => !val && handleClose()}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-visible rounded-3xl">
        <DialogHeader className="p-6 bg-muted/20 border-b border-muted-foreground/10">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-lg font-black tracking-tight">
                {isEdit ? "Edit Diary Account" : "New Diary Account"}
              </DialogTitle>
              <DialogDescription className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                {isEdit ? "Update Details" : "Savings Registration"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 space-y-6">
              {/* Refactored Customer Field using new Combobox */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field, fieldState }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                      <UserCircle2 className="w-4 h-4 text-primary" /> Select
                      Customer
                    </FormLabel>

                    <CustomerSearchCombobox
                      value={field.value}
                      displayName={selectedCustomerName}
                      disabled={isEdit}
                      error={!!fieldState.error}
                      onChange={(id, name) => {
                        customerNameCache.current[id] = name;
                        field.onChange(id); // updates form state
                        form.trigger("customerId");
                      }}
                    />

                    <FormMessage className="text-[10px] font-bold uppercase" />
                  </FormItem>
                )}
              />

              {/* Diary Name & Opening Balance (Grid remains similar) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="diaryName"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Diary Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Daily Savings"
                          className="h-12 rounded-xl bg-muted/40 border-muted-foreground/20"
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
                    <FormItem className="space-y-2">
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                        Opening Balance (₹)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          disabled={isEdit}
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value),
                            )
                          }
                          placeholder="0.00"
                          className="h-12 rounded-xl bg-muted/40 border-muted-foreground/20"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter className="p-6 bg-muted/10 border-t border-muted-foreground/10">
              <Button
                type="button"
                variant="ghost"
                onClick={handleClose}
                className="flex-1 rounded-xl h-12 font-bold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-xl h-12 font-black shadow-lg shadow-primary/20"
              >
                {isPending ? (
                  <Spinner className="mr-2 size-4" />
                ) : isEdit ? (
                  "Update Account"
                ) : (
                  "Open Account"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
