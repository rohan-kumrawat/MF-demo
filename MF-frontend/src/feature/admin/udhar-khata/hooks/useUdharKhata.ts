import { useCallback, useMemo, useState } from "react";
import {
  useQuery,
  useQueries,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { udharKhataService } from "../services/udharKhataService";
import type {
  CreateUdharEntryDto,
  CreateUdharPersonDto,
  UdharPerson,
  UdharEntry,
  KhataSummary,
  UdharDisplayEntry,
  UpdateUdharPersonDto,
} from "../types";

export interface UseUdharKhataReturn {
  filteredKhatedars: UdharPerson[];
  summary: KhataSummary;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  addKhatedar: (dto: CreateUdharPersonDto) => Promise<void>;
  editKhatedar: (id: string, dto: UpdateUdharPersonDto) => Promise<void>;
  removeKhatedar: (id: string) => Promise<void>;
  // Note: These now handle real API calls
  addEntry: (personId: string, dto: CreateUdharEntryDto) => Promise<void>;
  editEntry: (
    entryId: string,
    dto: Partial<CreateUdharEntryDto>,
  ) => Promise<void>;
  removeEntry: (personId: string, entryId: string) => Promise<void>;
  isLoading: boolean;
  isAddingPerson: boolean;
  isEditingPerson: boolean;
  isDeletingPerson: boolean;
  isAddingEntry: boolean;
  isEditingEntry: boolean;
  isDeletingEntry: boolean;
  isSummaryLoading: boolean;
}

function calcEntryTotals(entries: UdharEntry[]) {
  let totalLena = 0;
  let totalDena = 0;

  for (const entry of entries) {
    const amount =
      (Number(entry.amount) || 0) + (Number(entry.interestAmount) || 0);
    if (entry.entryType === "liya") {
      totalLena += amount;
    } else {
      totalDena += amount;
    }
  }

  return {
    totalLena: Math.round(totalLena * 100) / 100,
    totalDena: Math.round(totalDena * 100) / 100,
  };
}

export function useUdharKhata() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Query: Persons
  const { data: persons = [], isLoading } = useQuery({
    queryKey: ["udhar-khata", "persons"],
    queryFn: () => udharKhataService.getPersons(),
  });

  const entryQueries = useQueries({
    queries: persons.map((person) => ({
      queryKey: ["udhar-khata", "entries", person.id],
      queryFn: () => udharKhataService.getEntries(person.id),
      enabled: !!person.id && !isLoading,
    })),
  });

  // Filtered persons
  const filteredKhatedars = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return q
      ? persons.filter(
          (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q),
        )
      : persons;
  }, [persons, searchQuery]);

  // Mutations
  const addPersonMutation = useMutation({
    mutationFn: (dto: CreateUdharPersonDto) => udharKhataService.addPerson(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "persons"] });
    },
  });

  const deletePersonMutation = useMutation({
    mutationFn: (id: string) => udharKhataService.deletePerson(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "persons"] });
    },
  });

  const updatePersonMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateUdharPersonDto }) =>
      udharKhataService.updatePerson(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "persons"] });
    },
  });

  const addEntryMutation = useMutation({
    mutationFn: ({
      personId,
      dto,
    }: {
      personId: string;
      dto: CreateUdharEntryDto;
    }) => udharKhataService.addEntry(personId, dto),
    onSuccess: (_, { personId }) => {
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "persons"] });
      queryClient.invalidateQueries({
        queryKey: ["udhar-khata", "entries", personId],
      });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: (entryId: string) => udharKhataService.deleteEntry(entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "persons"] });
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "entries"] });
    },
  });

  const updateEntryMutation = useMutation({
    mutationFn: ({
      entryId,
      dto,
    }: {
      entryId: string;
      dto: Partial<CreateUdharEntryDto>;
    }) => udharKhataService.updateEntry(entryId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "persons"] });
      queryClient.invalidateQueries({ queryKey: ["udhar-khata", "entries"] });
    },
  });

  const addKhatedar = useCallback(
    async (dto: CreateUdharPersonDto) => {
      await addPersonMutation.mutateAsync(dto);
    },
    [addPersonMutation],
  );

  const editKhatedar = useCallback(
    async (id: string, dto: UpdateUdharPersonDto) => {
      await updatePersonMutation.mutateAsync({ id, dto });
    },
    [updatePersonMutation],
  );

  const removeKhatedar = useCallback(
    async (id: string) => {
      await deletePersonMutation.mutateAsync(id);
    },
    [deletePersonMutation],
  );

  const addEntry = useCallback(
    async (personId: string, dto: CreateUdharEntryDto) => {
      await addEntryMutation.mutateAsync({ personId, dto });
    },
    [addEntryMutation],
  );

  const removeEntry = useCallback(
    async (_personId: string, entryId: string) => {
      await deleteEntryMutation.mutateAsync(entryId);
    },
    [deleteEntryMutation],
  );

  const editEntry = useCallback(
    async (entryId: string, dto: Partial<CreateUdharEntryDto>) => {
      await updateEntryMutation.mutateAsync({ entryId, dto });
    },
    [updateEntryMutation],
  );

  // Compute summary from all entries so totals match ledger values
  const summary = useMemo<KhataSummary>(() => {
    let activeKhatedars = 0;
    for (const p of persons) {
      if (p.isActive) activeKhatedars += 1;
    }
    const totalKhatedars = persons.length;
    const inactiveKhatedars = totalKhatedars - activeKhatedars;

    const entryTotals = entryQueries.reduce(
      (acc, query) => {
        const totals = calcEntryTotals(query.data ?? []);
        return {
          totalLena: acc.totalLena + totals.totalLena,
          totalDena: acc.totalDena + totals.totalDena,
        };
      },
      { totalLena: 0, totalDena: 0 },
    );

    return {
      totalLena: Math.round(entryTotals.totalLena * 100) / 100,
      totalDena: Math.round(entryTotals.totalDena * 100) / 100,
      netPos:
        Math.round((entryTotals.totalLena - entryTotals.totalDena) * 100) / 100,
      totalKhatedars,
      activeKhatedars,
      inactiveKhatedars,
    };
  }, [entryQueries, persons]);

  const isSummaryLoading =
    isLoading || entryQueries.some((query) => query.isLoading);

  return {
    filteredKhatedars,
    summary,
    searchQuery,
    setSearchQuery,
    addKhatedar,
    editKhatedar,
    removeKhatedar,
    addEntry,
    editEntry,
    removeEntry,
    isLoading,
    isAddingPerson: addPersonMutation.isPending,
    isEditingPerson: updatePersonMutation.isPending,
    isDeletingPerson: deletePersonMutation.isPending,
    isAddingEntry: addEntryMutation.isPending,
    isEditingEntry: updateEntryMutation.isPending,
    isDeletingEntry: deleteEntryMutation.isPending,
    isSummaryLoading,
  };
}

// Separate hook for entries to be used inside KhatedarCard
export function usePersonEntries(personId: string) {
  return useQuery({
    queryKey: ["udhar-khata", "entries", personId],
    queryFn: () => udharKhataService.getEntries(personId),
    enabled: !!personId,
  });
}

export function useKhatedarDetail(personId: string) {
  const { data: person, isLoading: isLoadingPerson } = useQuery({
    queryKey: ["udhar-khata", "persons"],
    queryFn: () => udharKhataService.getPersons(),
    select: (persons) => persons.find((p) => p.id === personId),
  });

  const { data: rawEntries = [], isLoading: isLoadingEntries } =
    usePersonEntries(personId);

  const entries = useMemo<UdharDisplayEntry[]>(() => {
    // 1. Sort by date ascending to calculate the correct running balance
    const sorted = [...rawEntries].sort(
      (a, b) =>
        new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime(),
    );

    const { result } = sorted.reduce(
      (acc, e) => {
        // FIX: Explicitly convert the string amount to a number
        const val = Number(e.amount) || 0;
        const interest = Number(e.interestAmount) || 0;
        const totalVal = val + interest;

        const liye = e.entryType === "liya" ? val : null;
        const diye = e.entryType === "diya" ? val : null;

        // Perform addition/subtraction on numeric values
        const newBalance =
          acc.running + (e.entryType === "liya" ? totalVal : -totalVal);

        acc.result.push({
          id: e.id,
          date: e.entryDate,
          liye,
          diye,
          interestAmount:
            e.interestAmount != null ? Number(e.interestAmount) : null,
          dueDate: e.dueDate || null,
          balance: newBalance,
          remark: e.remark,
        });

        acc.running = newBalance;
        return acc;
      },
      { result: [] as UdharDisplayEntry[], running: 0 },
    );

    // 2. Reverse so that the newest entry appears at the top of the table
    return result.reverse();
  }, [rawEntries]);

  return { person, entries, isLoadingPerson, isLoadingEntries };
}
