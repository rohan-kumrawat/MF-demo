import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { loansService } from "@/services/admin/loans.service";
import { customersService } from "@/services/admin/customers.service";

export function useCollectionData() {
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  return useQuery({
    queryKey: ["collection-data"],
    queryFn: async () => {
      // Fetch all active loans
      const loans = await loansService.getAll({ status: "active" });

      // Fetch all customers
      const customers = await customersService.getAll();
      const customerMap = new Map(customers.map((c: any) => [c.id, c]));

      let totalDue = 0;
      let totalCollected = 0;
      let totalPending = 0;

      const collections = loans.map((loan) => {
        const customer = customerMap.get(loan.customerId) || ({} as any);

        // Mocking logic for collection status since we need more granular EMI tracking
        // In a real scenario, this would come from an aggregation endpoint
        const isPaid = false; // logic based on schedule or transaction
        const emi = Number(loan.emiAmount) || 0;

        if (!isPaid) {
          totalDue += emi;
          totalPending += emi;
        } else {
          totalCollected += emi;
        }

        return {
          id: loan.id,
          loanId: loan.id,
          customerId: loan.customerId,
          customerName: customer.firstName
            ? `${customer.firstName} ${customer.lastName || ""}`
            : "Unknown Customer",
          accountNo: loan.loanAccountNumber,
          agent: loan.agentId, // Would map to agent name
          emi,
          emiStatus: isPaid ? "green" : loan.overdue ? "red" : "yellow",
          emiLabel: isPaid ? "Paid" : loan.overdue ? "Overdue" : "Due",
          diaryBalance: 0, // Mocked for now
        };
      });

      return {
        collections,
        totalDue: totalDue + totalCollected,
        totalCollected,
        totalPending,
      };
    },
    enabled: hasHydrated,
  });
}
