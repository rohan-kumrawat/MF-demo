// src/feature/agent/components/CustomerSearchCard.tsx
import React from "react";
import { Phone, User, Wallet, ShieldAlert } from "lucide-react";
import { type AgentCustomer } from "../types";
import { formatRupee, getStatusColor } from "../../../data/demoData";
import { cn } from "../../../lib/utils";

interface Props {
  customer: AgentCustomer;
  onCollect: (customer: AgentCustomer) => void;
}

export const CustomerSearchCard = React.memo(function CustomerSearchCard({
  customer,
  onCollect,
}: Props) {
  return (
    <div
      id={`customer-${customer.id}`}
      className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
            <User size={20} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">{customer.name}</h4>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Phone size={10} /> {customer.phone}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 p-2 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">
            EMI Status
          </span>
          <div
            className={cn(
              "inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
              getStatusColor(customer.emiStatus),
            )}
          >
            {customer.emiLabel}
          </div>
        </div>
        <div className="bg-gray-50 p-2 rounded-2xl">
          <span className="text-[10px] font-bold text-gray-400 block uppercase mb-1">
            Diary Balance
          </span>
          <span className="text-xs font-bold text-gray-900">
            {formatRupee(customer.diaryBalance)}
          </span>
        </div>
      </div>

      <div className="flex gap-2 mt-1">
        <button
          onClick={() => onCollect(customer)}
          className="flex-1 gradient-primary text-white py-3 rounded-2xl font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Wallet size={16} />
          Collect Payment
        </button>
        {customer.risk === "High" && (
          <div
            className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive"
            title="High Risk Customer"
          >
            <ShieldAlert size={20} />
          </div>
        )}
      </div>
    </div>
  );
});
