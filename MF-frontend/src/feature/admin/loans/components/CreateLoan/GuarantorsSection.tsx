// src/feature/admin/loans/components/CreateLoan/GuarantorsSection.tsx
import { useState } from "react";
import {
  type UseFormRegister,
  type FieldErrors,
  type UseFieldArrayReturn,
  useFormContext,
} from "react-hook-form";
import { Users, UserPlus, Trash2, ChevronDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { inputCls, labelCls, type LoanFormData } from "./types";
import { customersService } from "@/services/admin/customers.service";
import type { Customer } from "@/types/customer.types";

interface Props {
  register: UseFormRegister<LoanFormData>;
  errors: FieldErrors<LoanFormData>;
  fields: UseFieldArrayReturn<LoanFormData, "guarantors">["fields"];
  append: UseFieldArrayReturn<LoanFormData, "guarantors">["append"];
  remove: UseFieldArrayReturn<LoanFormData, "guarantors">["remove"];
}

export function GuarantorsSection({
  register,
  errors,
  fields,
  append,
  remove,
}: Props) {
  const { setValue } = useFormContext<LoanFormData>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(
    null,
  );

  // Fetch customers for guarantor selection
  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["customers", "guarantor-select", searchQuery],
    queryFn: async () => {
      const response = await customersService.getAll({
        limit: 100,
        search: searchQuery || undefined,
      });
      return response || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const handleSelectCustomerAsGuarantor = (
    customer: Customer,
    index: number,
  ) => {
    // Auto-fill guarantor details from selected customer
    setValue(`guarantors.${index}.customerId`, customer.id);
    setValue(`guarantors.${index}.name`, customer.name);
    setValue(`guarantors.${index}.phone`, customer.phone);
    setValue(`guarantors.${index}.address`, customer.address);
    setValue(`guarantors.${index}.aadharNumber`, customer.aadharNumber || "");
    setOpenDropdownIndex(null);
    setSearchQuery("");
  };

  return (
    <div className="bg-white rounded-2xl border border-[#c1c6d5]/20 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#c1c6d5]/20">
        <h3 className="text-sm font-black text-[#121c28] flex items-center gap-2">
          <Users className="size-4 text-[#005eb0]" />
          Guarantors ({fields.length}/2)
        </h3>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({
              name: "",
              phone: "",
              relation: "",
              aadharNumber: "",
              address: "",
            })
          }
          disabled={fields.length >= 2}
          className="flex items-center gap-1.5 text-xs font-bold text-[#005eb0] border-[#005eb0]/30 hover:bg-[#005eb0]/5"
        >
          <UserPlus className="size-3.5" />
          Add Guarantor
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-6 bg-[#f8f9ff] rounded-xl border border-dashed border-[#c1c6d5]">
          <p className="text-sm text-[#717784] font-medium">
            No guarantors added. You can add up to 2.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="relative rounded-xl border border-[#c1c6d5]/30 p-5 bg-[#f8f9ff]/30"
          >
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute top-4 right-4 p-1.5 bg-white text-[#ba1a1a] hover:bg-[#ba1a1a]/10 rounded-md shadow-sm border border-[#ba1a1a]/20 transition-all"
            >
              <Trash2 className="size-4" />
            </button>
            <p className="text-xs font-black text-[#43474f] mb-4">
              GUARANTOR {index + 1}
            </p>

            {/* Customer Selector Dropdown */}
            <div className="mb-5 pb-4 border-b border-[#c1c6d5]/20">
              <label className={labelCls}>
                Select from Existing Customers (Optional)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdownIndex(
                      openDropdownIndex === index ? null : index,
                    )
                  }
                  className={`w-full px-4 py-2.5 bg-white border rounded-xl text-sm focus:outline-none transition-all text-left flex items-center justify-between ${
                    openDropdownIndex === index
                      ? "border-[#005eb0] ring-1 ring-[#005eb0]/20"
                      : "border-[#c3c6d1]/30 hover:border-[#c3c6d1]/50"
                  }`}
                >
                  <span className="text-[#717784]">
                    {customersLoading
                      ? "Loading customers..."
                      : "Search & select customer"}
                  </span>
                  <ChevronDown
                    className={`size-4 text-[#717784] transition-transform ${
                      openDropdownIndex === index ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {openDropdownIndex === index && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#c3c6d1]/30 rounded-xl shadow-lg z-50">
                    <div className="p-3 border-b border-[#c3c6d1]/20">
                      <Input
                        type="text"
                        placeholder="Search by name, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`${inputCls()} text-xs`}
                        autoFocus
                      />
                    </div>

                    <div className="max-h-64 overflow-y-auto">
                      {customersLoading ? (
                        <div className="p-4 flex items-center justify-center gap-2 text-[#717784]">
                          <Loader2 className="size-4 animate-spin" />
                          <span className="text-xs">Loading...</span>
                        </div>
                      ) : customers.length === 0 ? (
                        <div className="p-4 text-center text-[#717784]">
                          <p className="text-xs font-medium">
                            No customers found
                          </p>
                        </div>
                      ) : (
                        customers.map((customer) => (
                          <button
                            key={customer.id}
                            type="button"
                            onClick={() =>
                              handleSelectCustomerAsGuarantor(customer, index)
                            }
                            className="w-full text-left px-4 py-3 hover:bg-[#f8f9ff] border-b border-[#c3c6d1]/10 transition-all"
                          >
                            <p className="text-xs font-bold text-[#121c28]">
                              {customer.name}
                            </p>
                            <p className="text-[10px] text-[#717784] mt-0.5">
                              📱 {customer.phone} • 🏠 {customer.address}
                            </p>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-[#717784] mt-1.5">
                💡 Select a customer to auto-fill their details. You can edit
                them below.
              </p>
            </div>

            {/* Manual Guarantor Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Name *</label>
                <Input
                  {...register(`guarantors.${index}.name`)}
                  className={inputCls(!!errors.guarantors?.[index]?.name)}
                />
                {errors.guarantors?.[index]?.name && (
                  <p className="text-[10px] text-[#ba1a1a] mt-1">
                    {errors.guarantors[index]?.name?.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Phone *</label>
                <Input
                  {...register(`guarantors.${index}.phone`)}
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  className={inputCls(!!errors.guarantors?.[index]?.phone)}
                />
                {errors.guarantors?.[index]?.phone && (
                  <p className="text-[10px] text-[#ba1a1a] mt-1">
                    {errors.guarantors[index]?.phone?.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Relation *</label>
                <Input
                  {...register(`guarantors.${index}.relation`)}
                  placeholder="e.g. Brother, Friend"
                  className={inputCls(!!errors.guarantors?.[index]?.relation)}
                />
                {errors.guarantors?.[index]?.relation && (
                  <p className="text-[10px] text-[#ba1a1a] mt-1">
                    {errors.guarantors[index]?.relation?.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>Aadhar Number</label>
                <Input
                  {...register(`guarantors.${index}.aadharNumber`)}
                  inputMode="numeric"
                  maxLength={12}
                  placeholder="12-digit Aadhar number"
                  className={inputCls(
                    !!errors.guarantors?.[index]?.aadharNumber,
                  )}
                />
                {errors.guarantors?.[index]?.aadharNumber && (
                  <p className="text-[10px] text-[#ba1a1a] mt-1">
                    {errors.guarantors[index]?.aadharNumber?.message}
                  </p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Address *</label>
                <Input
                  {...register(`guarantors.${index}.address`)}
                  className={inputCls(!!errors.guarantors?.[index]?.address)}
                />
                {errors.guarantors?.[index]?.address && (
                  <p className="text-[10px] text-[#ba1a1a] mt-1">
                    {errors.guarantors[index]?.address?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
