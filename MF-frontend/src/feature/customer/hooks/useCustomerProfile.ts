import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { customersService } from "@/services/admin/customers.service";

export const useCustomerProfile = () => {
  const { user: authUser } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["customer-profile", authUser?.id],
    queryFn: () => customersService.getById(authUser!.id),
    enabled: !!authUser?.id,
  });

  return {
    user: data || authUser,
    isLoading,
    error,
  };
};
