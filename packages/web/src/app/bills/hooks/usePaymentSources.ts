import { AssignPaymentSourceDTO, PaymentSourceDTO } from "@fin/application";
import { BillsSDK, PaymentSourcesSDK } from "@fin/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePaymentSources() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["paymentSources"],
    queryFn: PaymentSourcesSDK.getPaymentSources,
  });

  const createAndAssignMutation = useMutation({
    mutationFn: async ({
      paymentSourceDto,
      billId,
    }: {
      paymentSourceDto: PaymentSourceDTO;
      billId: string;
    }) => {
      const created =
        await PaymentSourcesSDK.createPaymentSource(paymentSourceDto);
      const updatedBill: AssignPaymentSourceDTO = {
        id: billId,
        mutationType: "assignPaymentSource",
        paymentSourceId: created.id,
      };
      await BillsSDK.updateBill(billId, updatedBill);
      return { created, updatedBill };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentSources"] });
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });

  const assignMutation = useMutation({
    mutationFn: async ({
      billId,
      paymentSourceId,
    }: {
      billId: string;
      paymentSourceId: string;
    }) => {
      const updatedBill: AssignPaymentSourceDTO = {
        id: billId,
        mutationType: "assignPaymentSource",
        paymentSourceId,
      };
      return await BillsSDK.updateBill(billId, updatedBill);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bills"] });
    },
  });

  return {
    paymentSources: query.data ?? [],
    isLoadingSources: query.isLoading,
    isFetched: query.isFetched,
    createAndAssign: createAndAssignMutation.mutateAsync,
    isCreatingAndAssigning: createAndAssignMutation.isPending,
    assign: assignMutation.mutateAsync,
    isAssigning: assignMutation.isPending,
  };
}
