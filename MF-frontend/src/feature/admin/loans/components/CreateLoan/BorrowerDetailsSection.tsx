// src/feature/admin/loans/components/CreateLoan/BorrowerDetailsSection.tsx
import { useRef, useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
  type UseFormRegister,
  type UseFormSetValue,
  type FieldErrors,
  type Control,
} from "react-hook-form";
import { useWatch } from "react-hook-form";
import { Search, Check, Loader2, UserCircle2 } from "lucide-react";
import { useCustomers } from "@/feature/admin/customers/hooks/useCustomers";
import { Input } from "@/components/ui/input";
import {
  inputCls,
  labelCls,
  sectionHeaderCls,
  type LoanFormData,
} from "./types";

interface Props {
  register: UseFormRegister<LoanFormData>;
  setValue: UseFormSetValue<LoanFormData>;
  errors: FieldErrors<LoanFormData>;
  control: Control<LoanFormData>;
}

export function BorrowerDetailsSection({
  register,
  setValue,
  errors,
  control,
}: Props) {
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerOpen, setCustomerOpen] = useState(false);
  const customerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(customerQuery, 300);

  const { data: customersData, isLoading: loadingCustomers } = useCustomers(
    debouncedQuery ? { name: debouncedQuery } : undefined,
  );
  const filteredCustomers = customersData?.data ?? [];

  const watchedCustomerId = useWatch({ control, name: "customerId" });

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        customerRef.current &&
        !customerRef.current.contains(e.target as Node)
      )
        setCustomerOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-6">
      <h3 className={sectionHeaderCls}>
        <UserCircle2 className="size-4 text-[#005eb0]" />
        Borrower Details
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Search */}
        <div ref={customerRef} className="relative md:col-span-2">
          <label className={labelCls}>Select Customer *</label>
          <div
            className={`flex items-center gap-2 w-full px-3 py-2.5 bg-[#f8f9ff] border rounded-xl transition-all cursor-text ${
              customerOpen
                ? "border-[#005eb0] ring-1 ring-[#005eb0]/20"
                : errors.customerId
                  ? "border-[#ba1a1a]"
                  : "border-[#c3c6d1]/30"
            }`}
            onClick={() => setCustomerOpen(true)}
          >
            <Search className="size-4 text-[#717784] shrink-0" />
            <input
              value={customerQuery}
              onChange={(e) => {
                setCustomerQuery(e.target.value);
                setValue("customerId", "" as string);
                setValue("customerName", "");
                setCustomerOpen(true);
              }}
              onFocus={() => setCustomerOpen(true)}
              placeholder="Search customer by name or phone..."
              className="flex-1 bg-transparent text-sm outline-none text-[#121c28] placeholder:text-[#717784]"
            />
            {watchedCustomerId && (
              <Check className="size-4 text-[#1a8a58] shrink-0" />
            )}
          </div>
          {errors.customerId && (
            <p className="text-[10px] text-[#ba1a1a] mt-1 font-medium">
              {errors.customerId.message}
            </p>
          )}
          {customerOpen && (
            <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white rounded-xl border border-[#c1c6d5]/30 shadow-xl max-h-52 overflow-y-auto">
              {loadingCustomers ? (
                <div className="p-4 text-center text-xs text-[#717784]">
                  <Loader2 className="size-4 animate-spin inline mr-2" />
                  Loading...
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-xs text-[#717784]">
                  No customers found.
                </div>
              ) : (
                filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setValue("customerId", c.id, {
                        shouldValidate: true,
                        shouldDirty: true,
                      });
                      setValue("customerName", c.name, {
                        shouldDirty: true,
                      });
                      setValue("customerPhone", c.phone, {
                        shouldDirty: true,
                      });
                      setValue("customerAddress", c.address, {
                        shouldDirty: true,
                      });
                      setValue(
                        "fatherOrHusbandName",
                        c.fatherHusbandName || "",
                        {
                          shouldDirty: true,
                        },
                      );
                      setValue("memberSince", c.memberSince || "", {
                        shouldDirty: true,
                      });
                      setCustomerQuery(c.name);
                      setCustomerOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#f8f9ff] transition-colors"
                  >
                    <div className="size-8 rounded-full bg-[#005eb0] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {c.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-[11px] text-[#717784]">{c.phone}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div>
          <label className={labelCls}>Father / Husband Name</label>
          <Input
            {...register("fatherOrHusbandName")}
            placeholder="Enter full name"
            className={inputCls(!!errors.fatherOrHusbandName)}
          />
          {errors.fatherOrHusbandName && (
            <p className="text-[10px] text-[#ba1a1a] mt-1">
              {errors.fatherOrHusbandName.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>Aadhar Number</label>
          <Input
            {...register("aadharNumber")}
            placeholder="12-digit Aadhar number"
            inputMode="numeric"
            maxLength={12}
            className={inputCls(!!errors.aadharNumber)}
          />
          {errors.aadharNumber && (
            <p className="text-[10px] text-[#ba1a1a] mt-1">
              {errors.aadharNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>Account No.</label>
          <Input
            {...register("accountNumber")}
            placeholder="Bank account number"
            className={inputCls(!!errors.accountNumber)}
          />
          {errors.accountNumber && (
            <p className="text-[10px] text-[#ba1a1a] mt-1">
              {errors.accountNumber.message}
            </p>
          )}
        </div>

        <div>
          <label className={labelCls}>Member Since (Auto)</label>
          <Input
            {...register("memberSince")}
            placeholder="Auto-filled from customer"
            className={inputCls()}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
