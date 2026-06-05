import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DatePickerField } from "@/components/ui/date-picker-field";
import { createCustomerSchema, type CreateCustomerFormData } from "../schemas";
import { useCreateCustomer } from "../hooks/useCustomers";
import { localToday } from "@/lib/utils";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function AddCustomerModal({ isOpen, onClose }: Props) {
  const { mutateAsync: createCustomer, isPending } = useCreateCustomer();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateCustomerFormData>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      phone: "",
      address: "",
      aadharNumber: "",
      fatherHusbandName: "",
      memberSince: localToday(),
      nomineeName: "",
      nomineeRelation: "",
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: CreateCustomerFormData) => {
    const payload = {
      username: data.username,
      password: data.password,
      name: data.name,
      phone: data.phone,
      address: data.address,
      aadharNumber: data.aadharNumber || null,
      fatherHusbandName: data.fatherHusbandName,
      memberSince: data.memberSince,
      nomineeName: data.nomineeName || null,
      nomineeRelation: data.nomineeRelation || null,
    };
    try {
      console.log("payload", payload);
      await createCustomer({ ...payload, role: "customer" });
      reset();
      onClose();
    } catch (error: any) {
      console.error("Failed to create customer", error);

      const responseData = error.response?.data;

      // Handle 400 Validation Errors
      if (error.response?.status === 400 && responseData?.errors) {
        responseData.errors.forEach(
          (err: { field: string; message: string }) => {
            setError(err.field as any, {
              type: "server",
              message: err.message,
            });
          },
        );
        toast.error(
          responseData.message || "Validation failed. Please check the fields.",
        );
        return;
      }

      // Handle other errors, excluding 401 (handled by refresh token mechanism)
      if (error.response?.status !== 401) {
        const message =
          responseData?.message ||
          "Something went wrong while creating the customer.";
        toast.error(message);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#001e40]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#c1c6d5]/20 flex items-center justify-between bg-[#f1f3fc]">
          <div className="flex items-center gap-2 text-[#003366]">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-lg font-bold">Add New Customer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#717784] hover:text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Full Name *
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Ramesh Kumar"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.name ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.name && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Father/Husband Name *
                </label>
                <Input
                  {...register("fatherHusbandName")}
                  placeholder="e.g. Suresh Kumar"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.fatherHusbandName ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.fatherHusbandName && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.fatherHusbandName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Phone Number *
                </label>
                <Input
                  {...register("phone")}
                  placeholder="10 digit number"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.phone ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.phone && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Aadhar Number
                </label>
                <Input
                  {...register("aadharNumber")}
                  placeholder="12 digit number"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.aadharNumber ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.aadharNumber && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.aadharNumber.message}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Address *
                </label>
                <Input
                  {...register("address")}
                  placeholder="Full address"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.address ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.address && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Username (Login ID) *
                </label>
                <Input
                  {...register("username")}
                  placeholder="e.g. ramesh_kumar"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.username ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.username && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    placeholder="e.g. password"
                    className="bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 pr-10"
                  />
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Member Since *
                </label>
                <DatePickerField
                  value={watch("memberSince")}
                  onChange={(value) => setValue("memberSince", value ?? "")}
                  buttonClassName={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.memberSince ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.memberSince && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.memberSince.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Nominee Name
                </label>
                <Input
                  {...register("nomineeName")}
                  placeholder="e.g. Suman Devi"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.nomineeName ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.nomineeName && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.nomineeName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#414753] mb-1">
                  Nominee Relation
                </label>
                <Input
                  {...register("nomineeRelation")}
                  placeholder="e.g. Wife"
                  className={`bg-[#f1f3fc] border-transparent focus-visible:ring-[#005eb0]/20 ${errors.nomineeRelation ? "border-[#ba1a1a] focus-visible:ring-[#ba1a1a]/20" : ""}`}
                />
                {errors.nomineeRelation && (
                  <p className="text-[#ba1a1a] text-xs mt-1">
                    {errors.nomineeRelation.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="px-6 py-4 border-t border-[#c1c6d5]/20 bg-[#f1f3fc]/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-[#414753] hover:bg-[#f1f3fc] rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 bg-[#005eb0] text-white text-sm font-bold rounded-xl hover:bg-[#004e92] transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Customer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
