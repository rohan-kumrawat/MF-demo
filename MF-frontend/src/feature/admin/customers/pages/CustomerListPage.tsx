import { useState } from "react";
import { UserPlus } from "lucide-react";
import {
  CustomerStats,
  CustomerFilters,
  CustomerTable,
  AddCustomerModal,
} from "..";
import { useCustomerList } from "../hooks/useCustomerList";
import { Button } from "@/components/ui/button";

export default function CustomerListPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const {
    search,
    filters,
    page,
    setPage,
    customers,
    totalPages,
    pageSize,
    serverTotal,
    isLoading,
    isFetching,
    handleFilterChange,
    handleSearchChange,
    clearFilters,
  } = useCustomerList();

  return (
    <div className="p-4 md:p-8 space-y-10 animate-in fade-in duration-700 pb-24 md:pb-8">
      {/* Header & Primary Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            Customers
          </h1>
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Managing {serverTotal} total active accounts
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="hidden md:flex rounded-2xl h-12 px-8 font-black gap-2 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary hover:bg-primary/90"
        >
          <UserPlus className="w-5 h-5" />
          Add New Customer
        </Button>
      </div>

      {/* Stats Grid */}
      <CustomerStats customers={customers} serverTotal={serverTotal} />

      {/* Search + Filters */}
      <CustomerFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        search={search}
        onSearchChange={handleSearchChange}
      />

      {/* Table Section */}
      <div className="relative min-h-[400px]">
        {isLoading || isFetching ? (
          <div className="absolute inset-0 flex flex-col justify-center items-center gap-4 bg-background/50 backdrop-blur-sm rounded-3xl z-10">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            </div>
            <p className="text-sm font-bold text-muted-foreground animate-pulse tracking-widest uppercase">
              Loading Customers...
            </p>
          </div>
        ) : (
          <CustomerTable
            customers={customers}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            pageSize={pageSize}
            totalFiltered={serverTotal}
          />
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        size="icon"
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-2xl shadow-primary/40 z-40 bg-primary hover:bg-primary/90 transition-transform active:scale-90"
      >
        <UserPlus className="w-6 h-6" />
      </Button>

      {/* Add Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
