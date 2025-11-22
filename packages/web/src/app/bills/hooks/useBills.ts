import { BillDTO, BillFilter, UpdateBillDTO } from "@fin/application";
import { BillsSDK } from "@fin/sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export function useBills(filter: BillFilter) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["bills", filter],
    queryFn: () => BillsSDK.getBills(filter),
    refetchOnWindowFocus: false,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBillDTO }) =>
      BillsSDK.updateBill(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["bills", filter] });
      const previous = queryClient.getQueryData<BillDTO[]>(["bills", filter]);
      queryClient.setQueryData<BillDTO[]>(["bills", filter], (old) => {
        if (!old) return old;
        return old.map((bill) =>
          bill.id === id ? { ...bill, ...data } : bill
        );
      });

      return { previous };
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<BillDTO[]>(["bills", filter], (old) => {
        if (!old) return old;
        return old.map((bill) => (bill.id === updated.id ? updated : bill));
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bills", filter], context.previous);
      }
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<BillDTO>) => BillsSDK.createBill(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: ["bills", filter] });
      const previous = queryClient.getQueryData<BillDTO[]>(["bills", filter]);

      const tempBill: BillDTO = {
        id: `temp-${Date.now()}`,
        name: data.name ?? "",
        amount: data.amount ?? 0,
        dueDate: data.dueDate ?? "",
        order: previous?.length ?? 0,
        ...data,
      } as BillDTO;

      queryClient.setQueryData<BillDTO[]>(["bills", filter], (old) => [
        ...(old || []),
        tempBill,
      ]);

      return { previous, tempId: tempBill.id };
    },
    onSuccess: (created, _vars, context) => {
      queryClient.setQueryData<BillDTO[]>(["bills", filter], (old) => {
        if (!old) return [created];
        return old.map((bill) =>
          bill.id === context.tempId ? created : bill
        );
      });
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bills", filter], context.previous);
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => BillsSDK.deleteBill(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["bills", filter] });
      const previous = queryClient.getQueryData<BillDTO[]>(["bills", filter]);

      queryClient.setQueryData<BillDTO[]>(
        ["bills", filter],
        (old) => old?.filter((bill) => bill.id !== id) ?? []
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bills", filter], context.previous);
      }
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedBills: BillDTO[]) => {
      const updates = orderedBills.map((bill, idx) => ({
        id: bill.id,
        order: idx,
      }));
      return BillsSDK.reorderBills(updates);
    },
    onMutate: async (newBills) => {
      await queryClient.cancelQueries({ queryKey: ["bills", filter] });
      const previous = queryClient.getQueryData<BillDTO[]>(["bills", filter]);

      const optimisticBills = newBills.map((bill, idx) => ({
        ...bill,
        order: idx,
      }));
      queryClient.setQueryData<BillDTO[]>(["bills", filter], optimisticBills);

      return { previous };
    },
    onSuccess: (response) => {
      queryClient.setQueryData<BillDTO[]>(["bills", filter], response.bills);
    },
    onError: (_err, _newBills, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["bills", filter], context.previous);
      }
    },
  });

  return {
    bills: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    updateBill: updateMutation.mutateAsync,
    createBill: createMutation.mutateAsync,
    deleteBill: deleteMutation.mutateAsync,
    reorderBills: reorderMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  };
}
