import React from "react";
import { useNavigate } from "react-router-dom";
import { Frown, ChevronRight } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { formatCurrency } from "@/lib/utils";
import type { Customer } from "../types";

interface Props {
  customers: Customer[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  totalFiltered: number;
}

const getInitials = (name: string) => {
  return name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";
};

const StatusBadge = ({ emiStatus }: { emiStatus?: string }) => {
  const status =
    emiStatus === "red" || emiStatus === "defaulter"
      ? "defaulter"
      : emiStatus === "yellow" || emiStatus === "orange"
        ? "due"
        : "active";

  switch (status) {
    case "defaulter":
      return (
        <Badge
          variant="destructive"
          className="uppercase tracking-tight px-3 py-1 rounded-full text-[10px] font-black"
        >
          Defaulter
        </Badge>
      );
    case "due":
      return (
        <Badge
          variant="warning"
          className="uppercase tracking-tight px-3 py-1 rounded-full text-[10px] font-black"
        >
          Due
        </Badge>
      );
    default:
      return (
        <Badge
          variant="success"
          className="uppercase tracking-tight px-3 py-1 rounded-full text-[10px] font-black"
        >
          Active
        </Badge>
      );
  }
};

export const CustomerTable = React.memo(function CustomerTable({
  customers,
  page,
  totalPages,
  onPageChange,
  pageSize,
  totalFiltered,
}: Props) {
  const navigate = useNavigate();

  const renderPaginationItems = () => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink onClick={() => onPageChange(1)} isActive={page === 1}>
            1
          </PaginationLink>
        </PaginationItem>,
      );

      if (page > 3) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={page === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      if (page < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => onPageChange(totalPages)}
            isActive={page === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }
    return items;
  };

  return (
    <Card className="overflow-hidden border-none shadow-sm bg-card/50 backdrop-blur-sm">
      {customers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Frown className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <p className="text-base font-semibold text-foreground">
            कोई customer नहीं मिला
          </p>
          <p className="text-sm text-muted-foreground mt-1 max-w-[200px]">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-b border-border/50">
                  <TableHead className="h-12 px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    Customer Name
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    Phone
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    Diary Balance
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap text-right">
                    Outstanding Loan
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap">
                    Risk
                  </TableHead>
                  <TableHead className="h-12 px-6 text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest whitespace-nowrap text-center">
                    Status
                  </TableHead>
                  <TableHead className="h-12 w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const isDefaulter =
                    customer.emiStatus === "red" ||
                    customer.emiStatus === "defaulter";

                  return (
                    <TableRow
                      key={customer.id}
                      onClick={() =>
                        navigate(`/admin/customers/${customer.id}`)
                      }
                      className="hover:bg-muted/20 transition-colors group cursor-pointer border-b border-border/40"
                    >
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-10 w-10 border border-border/50 shadow-xs">
                            <AvatarFallback
                              className={`${isDefaulter ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"} font-bold text-xs`}
                            >
                              {getInitials(customer.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-sm leading-tight">
                              {customer.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                              {customer.customerCode ||
                                customer.accountNo ||
                                "N/A"}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-sm font-medium text-muted-foreground whitespace-nowrap">
                        <span className="text-foreground/70">+91</span>{" "}
                        {customer.phone}
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className="font-bold text-foreground text-sm tabular-nums">
                          {formatCurrency(customer.diaryBalance)}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <span
                          className={`font-bold text-sm tabular-nums ${isDefaulter ? "text-destructive" : "text-foreground"}`}
                        >
                          {customer.activeLoan
                            ? formatCurrency(customer.activeLoan)
                            : "₹0"}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              customer.risk === "High"
                                ? "bg-destructive animate-pulse"
                                : customer.risk === "Medium"
                                  ? "bg-warning"
                                  : "bg-success"
                            }`}
                          />
                          <span
                            className={`text-xs font-bold uppercase tracking-tight ${
                              customer.risk === "High"
                                ? "text-destructive"
                                : customer.risk === "Medium"
                                  ? "text-warning"
                                  : "text-success"
                            }`}
                          >
                            {customer.risk || "Low"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <StatusBadge emiStatus={customer.emiStatus} />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <ChevronRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="px-6 py-6 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground font-medium order-2 sm:order-1">
              Showing{" "}
              <span className="font-bold text-foreground">
                {(page - 1) * pageSize + 1}
              </span>
              –
              <span className="font-bold text-foreground">
                {Math.min(page * pageSize, totalFiltered)}
              </span>{" "}
              of{" "}
              <span className="font-bold text-foreground">{totalFiltered}</span>{" "}
              customers
            </p>

            <div className="order-1 sm:order-2">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => onPageChange(Math.max(1, page - 1))}
                      className={
                        page === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        onPageChange(Math.min(totalPages, page + 1))
                      }
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </>
      )}
    </Card>
  );
});
