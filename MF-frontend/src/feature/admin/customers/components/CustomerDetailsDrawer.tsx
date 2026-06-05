import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Edit2,
  Save,
  User,
  CalendarDays,
  Eye,
  EyeOff,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateCustomerSchema, type UpdateCustomerFormData } from "../schemas";
import { useUpdateCustomer, useDeleteCustomer } from "../hooks/useCustomers";
import type { Customer } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer;
}

export function CustomerDetailsDrawer({ isOpen, onClose, customer }: Props) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { mutateAsync: updateCustomer, isPending } = useUpdateCustomer();
  const { mutateAsync: deleteCustomer, isPending: isDeleting } =
    useDeleteCustomer();

  const handleDelete = async () => {
    try {
      await deleteCustomer(customer.id);
      toast.success("Customer deleted successfully");
      onClose();
      navigate("/admin/customers");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete customer");
    }
  };

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, dirtyFields },
  } = useForm<UpdateCustomerFormData>({
    resolver: zodResolver(updateCustomerSchema),
    defaultValues: {
      username: customer.username || "",
      password: "",
      name: customer.name || "",
      phone: customer.phone || "",
      address: customer.address || "",
      aadharNumber: customer.aadharNumber || "",
      fatherHusbandName: customer.fatherHusbandName || "",
      memberSince: customer.memberSince
        ? customer.memberSince.split("T")[0]
        : "",
      nomineeName: customer.nomineeName || "",
      nomineeRelation: customer.nomineeRelation || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        username: customer.username || "",
        password: "",
        name: customer.name || "",
        phone: customer.phone || "",
        address: customer.address || "",
        aadharNumber: customer.aadharNumber || "",
        fatherHusbandName: customer.fatherHusbandName || "",
        memberSince: customer.memberSince
          ? customer.memberSince.split("T")[0]
          : "",
        nomineeName: customer.nomineeName || "",
        nomineeRelation: customer.nomineeRelation || "",
      });
    }
  }, [isOpen, customer, reset]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setIsEditing(false);
      onClose();
    }
  };

  const onSubmit = async (data: UpdateCustomerFormData) => {
    const payload = (
      Object.keys(dirtyFields) as (keyof UpdateCustomerFormData)[]
    ).reduce<Partial<UpdateCustomerFormData>>((acc, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    try {
      await updateCustomer({ id: customer.id, data: payload });
      toast.success("Customer updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      const responseData = error.response?.data;
      if (error.response?.status === 400 && responseData?.errors) {
        responseData.errors.forEach(
          (err: { field: string; message: string }) => {
            setError(err.field as keyof UpdateCustomerFormData, {
              type: "server",
              message: err.message,
            });
          },
        );
        return;
      }
      toast.error(responseData?.message || "Something went wrong.");
    }
  };

  const inputCls = (hasError?: boolean) =>
    `border border-slate-200 font-medium transition-all ${
      hasError ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/30" : ""
    } ${!isEditing ? "bg-[#f1f3fc]/50 opacity-80 cursor-not-allowed" : "bg-white"}`;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-white rounded-2xl p-0 overflow-hidden border-none">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col max-h-[85vh]"
        >
          {/* HEADER */}
          <DialogHeader className="px-4 py-4 border-b border-[#c1c6d5]/20 bg-slate-50/50">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-[#005eb0] flex items-center justify-center text-white shrink-0 shadow-sm">
                <User size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <DialogTitle className="text-xl font-extrabold text-[#001e40]">
                      {isEditing ? "Edit Profile" : customer.name}
                    </DialogTitle>
                    {customer.customerCode && (
                      <Badge
                        variant="outline"
                        className="bg-slate-100/50 border-slate-200 text-[#414753] font-mono text-[10px] px-1.5 h-5"
                      >
                        customer code: {customer.customerCode}
                      </Badge>
                    )}
                    {!isEditing && (
                      <Badge
                        variant="secondary"
                        className="bg-[#005eb0]/10 text-[#005eb0] border-none font-bold text-[10px] h-5"
                      >
                        CUSTOMER
                      </Badge>
                    )}
                  </div>
                  <DialogDescription className="flex items-center gap-2 text-[#717784] font-medium text-xs">
                    <p className="text-accent-foreground font-regular text-sm">
                      Username:
                      <span className="text-[#005eb0] font-bold">
                        @{customer.username}
                      </span>{" "}
                    </p>

                    <span className="text-[#c1c6d5]">·</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Member since{" "}
                      {new Date(
                        customer.memberSince || "",
                      ).toLocaleDateString()}
                    </span>
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {[
                  {
                    id: "name",
                    label: "Full Name *",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "phone",
                    label: "Phone Number *",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "address",
                    label: "Address *",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "fatherHusbandName",
                    label: "Father/Husband Name *",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "aadharNumber",
                    label: "Aadhar Number",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "memberSince",
                    label: "Member Since *",
                    type: "date",
                    readonly: false,
                  },
                  {
                    id: "nomineeName",
                    label: "Nominee Name",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "nomineeRelation",
                    label: "Nominee Relation",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "username",
                    label: "Username",
                    type: "text",
                    readonly: false,
                  },
                  {
                    id: "password",
                    label: "Password (leave blank to keep current)",
                    type: showPassword ? "text" : "password",
                    readonly: false,
                  },
                ].map((field) => (
                  <div
                    key={field.id}
                    className={field.id === "address" ? "md:col-span-2" : ""}
                  >
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-[#717784] mb-1.5 ml-0.5">
                      {field.label}
                    </label>
                    <div className="relative">
                      <Input
                        type={field.type}
                        {...register(field.id as keyof UpdateCustomerFormData)}
                        className={inputCls(
                          !!errors[field.id as keyof UpdateCustomerFormData],
                        )}
                        readOnly={!isEditing}
                      />
                      {field.id === "password" && isEditing && (
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#717784] hover:text-[#003366] transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                    {errors[field.id as keyof UpdateCustomerFormData] && (
                      <p className="text-[#ba1a1a] text-xs mt-1.5 font-medium italic">
                        {
                          errors[field.id as keyof UpdateCustomerFormData]
                            ?.message
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div className="border-t border-[#c1c6d5]/30 px-6 py-4 bg-slate-50/80 backdrop-blur-sm">
            {isEditing ? (
              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                  disabled={isPending}
                  className="hover:bg-slate-200 text-[#414753] w-1/2 font-semibold"
                >
                  Discard Changes
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-1/2   bg-primary hover:bg-primary/80 text-white shadow-md transition-all active:scale-95"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Updates
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[#ba1a1a]/50 text-[#ba1a1a] hover:bg-[#ba1a1a]/10 hover:text-[#ba1a1a] px-3"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="border border-[#ba1a1a]">
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="flex flex-col gap-2">
                        <span>
                          This action cannot be undone. This will permanently
                          delete the customer and remove their data from our
                          servers.
                        </span>
                        <span className="font-medium">
                          यह कार्रवाई वापस नहीं ली जा सकती। इससे ग्राहक और उनका
                          सारा डेटा हमारे सर्वर से हमेशा के लिए डिलीट हो जाएगा।
                        </span>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="!bg-[#ba1a1a] !text-white hover:!bg-[#ba1a1a]/90"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1 border-[#c1c6d5] text-[#414753] hover:bg-white"
                >
                  Close
                </Button>
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="flex-1 bg-[#005eb0] hover:bg-[#004a8c] text-white shadow-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
