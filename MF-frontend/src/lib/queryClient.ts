import { QueryCache, MutationCache, QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min — don't refetch what's fresh
      retry: (failureCount, error) => {
        // Don't retry 401/403/404 — retrying won't help
        const status = (error as AxiosError)?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return failureCount < 2;
      },
    },
  },
  // ─── Global error handler ─────────────────────────────────────────────
  queryCache: new QueryCache({
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ?? "Something went wrong";
      toast.error(message);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message ?? "Action failed";
      toast.error(message);
    },
  }),
});
