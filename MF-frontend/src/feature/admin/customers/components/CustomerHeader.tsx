import { Phone, UserCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CustomerDetailsDrawer } from "./CustomerDetailsDrawer";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Customer } from "../types";

export function CustomerHeader({ customer }: { customer: Customer }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();

  const getDisplayStatus = () => {
    const s = customer.emiStatus?.toLowerCase();
    if (s === "defaulter" || s === "red")
      return { status: "red" as const, label: "Defaulter" };
    if (s === "due" || s === "yellow" || s === "orange")
      return { status: "yellow" as const, label: "Due" };
    return { status: "green" as const, label: "Active" };
  };

  const { status, label } = getDisplayStatus();

  return (
    <div className="bg-card rounded-xl p-4 border border-border/60 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 flex-1 min-w-0 w-full">
        {/* Back Button Integrated */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="h-9 w-9 rounded-lg shrink-0 hover:bg-muted"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <Avatar className="w-12 h-12 rounded-full border border-border/50">
          <AvatarFallback className="bg-primary text-white text-lg font-bold">
            {customer.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-lg md:text-xl font-bold text-foreground truncate tracking-tight">
              {customer.name}
            </h2>
            <StatusBadge status={status} label={label} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="outline"
              className="bg-muted/30 text-xs font-medium py-0 px-2 h-6 flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              +91 {customer.phone}
            </Badge>
            {customer.customerCode && (
              <Badge
                variant="outline"
                className="bg-muted/30 text-xs font-medium py-0 px-2 h-6 flex items-center gap-1"
              >
                ID: {customer.customerCode}
              </Badge>
            )}
            {customer.aadharNumber && (
              <Badge
                variant="outline"
                className="text-xs font-medium py-0 px-2 h-6 flex items-center gap-1"
              >
                <UserCircle className="w-3 h-3" />
                {customer.aadharNumber}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end md:border-l md:border-border/60 md:pl-4">
        <Button
          size="sm"
          onClick={() => setDrawerOpen(true)}
          className="h-9 rounded-lg font-bold px-4 shadow-sm"
        >
          View Details
        </Button>
      </div>

      <CustomerDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        customer={customer}
      />
    </div>
  );
}
