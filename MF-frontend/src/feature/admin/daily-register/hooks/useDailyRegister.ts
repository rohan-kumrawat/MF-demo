// src/feature/admin/daily-register/hooks/useDailyRegister.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { dailyRegisterService } from "../services/dailyRegisterService";
import type { CreateDayDto, CreateEntryDto } from "../types";

const QUERY_KEYS = {
  days: () => ["daily-register", "days"] as const,
  entries: (dayId: string) =>
    ["daily-register", "days", dayId, "entries"] as const,
};

export function useDayRegisters() {
  return useQuery({
    queryKey: QUERY_KEYS.days(),
    queryFn: dailyRegisterService.getDays,
  });
}

export function useDayEntries(dayId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.entries(dayId),
    queryFn: () => dailyRegisterService.getEntries(dayId),
    enabled: !!dayId,
  });
}

export function useDailyRegisterMutations() {
  const queryClient = useQueryClient();

  const openDay = useMutation({
    mutationFn: (dto: CreateDayDto) => dailyRegisterService.openDay(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.days() });
      queryClient.invalidateQueries({ queryKey: ["vault", "status"] });
    },
  });

  const addEntry = useMutation({
    mutationFn: ({ dayId, dto }: { dayId: string; dto: CreateEntryDto }) =>
      dailyRegisterService.addEntry(dayId, dto),
    onSuccess: (_, { dayId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.entries(dayId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.days() });
      queryClient.invalidateQueries({ queryKey: ["vault", "status"] });
    },
  });

  const updateEntry = useMutation({
    mutationFn: ({
      id,
      dto,
    }: {
      id: string;
      dto: Partial<CreateEntryDto>;
      dayId: string;
    }) => dailyRegisterService.updateEntry(id, dto),
    onSuccess: (_, { dayId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.entries(dayId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.days() });
      queryClient.invalidateQueries({ queryKey: ["vault", "status"] });
    },
  });

  const deleteEntry = useMutation({
    mutationFn: ({ id }: { id: string; dayId: string }) =>
      dailyRegisterService.deleteEntry(id),
    onSuccess: (_, { dayId }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.entries(dayId) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.days() });
      queryClient.invalidateQueries({ queryKey: ["vault", "status"] });
    },
  });

  return {
    openDay,
    addEntry,
    updateEntry,
    deleteEntry,
    isOpening: openDay.isPending,
    isAdding: addEntry.isPending,
    isUpdating: updateEntry.isPending,
    isDeleting: deleteEntry.isPending,
  };
}
