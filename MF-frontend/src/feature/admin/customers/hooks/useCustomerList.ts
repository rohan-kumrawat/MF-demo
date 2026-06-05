import { useState, useMemo, useCallback } from "react";
import type { CustomerFilters as FilterType } from "../types";
import { useCustomers } from "./useCustomers";
import { useDebounce } from "@/hooks/useDebounce";

const PAGE_SIZE = 10;

export function useCustomerList() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<FilterType>({
    status: "all",
    risk: "all",
    agent: "all",
  });
  const [page, setPage] = useState(1);

  const activeFilters = useMemo(() => {
    return {
      status: filters.status === "all" ? undefined : filters.status,
      risk: filters.risk === "all" ? undefined : filters.risk,
      agent: filters.agent === "all" ? undefined : filters.agent,
    };
  }, [filters]);

  const {
    data: serverData,
    isLoading,
    isFetching,
  } = useCustomers({
    page,
    limit: PAGE_SIZE,
    name: debouncedSearch || undefined,
    ...activeFilters,
  });

  const pageCustomers = serverData?.data ?? [];
  const serverTotal = serverData?.total ?? 0;

  // We no longer filter client-side because pagination breaks if we do.
  // All filtering is now delegated to the backend query.
  const filteredCustomers = pageCustomers;

  const totalPages = Math.max(1, Math.ceil(serverTotal / PAGE_SIZE));

  const handleFilterChange = useCallback(
    (key: keyof FilterType, value: string) => {
      setFilters((f) => ({ ...f, [key]: value }));
      setPage(1);
    },
    [],
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ status: "all", risk: "all", agent: "all" });
    setPage(1);
  }, []);

  return {
    search,
    filters,
    page,
    setPage,
    customers: filteredCustomers,
    totalPages,
    pageSize: PAGE_SIZE,
    serverTotal,
    isLoading,
    isFetching,
    handleFilterChange,
    handleSearchChange,
    clearFilters,
  };
}
