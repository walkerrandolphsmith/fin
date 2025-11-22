"use client";

import ListSkeleton from "@/components/ListSkeleton";
import { PaymentSourceDTO, UpdatePaymentSourceDTO } from "@fin/application";
import { PaymentSourceType } from "@fin/domain";
import { PaymentSourcesSDK } from "@fin/sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import PaymentSourceDetails from "./PaymentSourceDetails";
import PaymentSourcesList from "./PaymentSources";
export default function PaymentSourcesLayout() {
  const queryClient = useQueryClient();
  const [selectedPaymentSourceId, setSelectedPaymentSourceId] = useState<
    string | null
  >(null);
  const [newPaymentSource, setNewPaymentSource] =
    useState<Partial<PaymentSourceDTO> | null>(null);

  const {
    data: paymentSources,
    isLoading,
    isError,
  } = useQuery<PaymentSourceDTO[]>({
    queryKey: ["paymentSources"],
    queryFn: PaymentSourcesSDK.getPaymentSources,
    refetchOnWindowFocus: false,
  });

  const handleSave = async (
    paymentSourceId: string,
    data: UpdatePaymentSourceDTO
  ) => {
    try {
      const dto = await PaymentSourcesSDK.updatePaymentSource(
        paymentSourceId,
        data
      );
      queryClient.setQueryData<PaymentSourceDTO[]>(["paymentSources"], (old) =>
        old?.map((b) => (b.id === paymentSourceId ? { ...b, ...dto } : b))
      );
      return dto;
    } catch (error) {
      console.error("Failed to save paymentSource", error);
    }
  };

  const handleAddNew = () => {
    const tempId = "new-" + Date.now();
    setNewPaymentSource({
      id: tempId,
      name: "",
      type: PaymentSourceType.CASH,
    });
    setSelectedPaymentSourceId(tempId);
  };

  const handleNewPaymentSourceChange = (
    field: "name" | "type" | "details",
    value: string | number
  ) => {
    if (!newPaymentSource) return;
    setNewPaymentSource((prev) => ({ ...prev!, [field]: value }));
  };

  const handleSaveNew = async (data: Partial<PaymentSourceDTO>) => {
    try {
      const created = await PaymentSourcesSDK.createPaymentSource(data);
      queryClient.setQueryData<PaymentSourceDTO[]>(
        ["paymentSources"],
        (old) => [...(old || []), created]
      );
      setSelectedPaymentSourceId(created.id);
      setNewPaymentSource(null);
      return created;
    } catch (error) {
      console.error("Failed to create paymentSource", error);
      return null;
    }
  };

  const handleDelete = async (paymentSourceId: string) => {
    if (!confirm("Are you sure you want to delete this paymentSource?"))
      return;
    try {
      await PaymentSourcesSDK.deletePaymentSource(paymentSourceId);
      queryClient.setQueryData<PaymentSourceDTO[]>(
        ["paymentSources"],
        (old) => {
          if (!old) return [];
          return old.filter((b) => b.id !== paymentSourceId);
        }
      );
      const updatedPaymentSources =
        queryClient.getQueryData<PaymentSourceDTO[]>(["paymentSources"]) || [];
      const deletedIndex = paymentSources.findIndex(
        (e) => e.id === paymentSourceId
      );
      const nextPaymentSource =
        updatedPaymentSources[deletedIndex] ||
        updatedPaymentSources[deletedIndex - 1] ||
        updatedPaymentSources[0] ||
        null;
      console.log("next id", nextPaymentSource);
      setSelectedPaymentSourceId(nextPaymentSource?.id ?? null);
      await queryClient.invalidateQueries({ queryKey: ["paymentSources"] });
    } catch (err) {
      console.error(err);
      alert("Failed to delete paymentSource");
    }
  };

  const isNewSelected = selectedPaymentSourceId?.startsWith("new-");
  const selectedExistingPaymentSource =
    paymentSources?.find((b) => b.id === selectedPaymentSourceId) || null;

  const ref = useRef(false);

  useEffect(() => {
    if (!paymentSources || paymentSources.length === 0) return;
    if (!ref.current) {
      const firstPaymentSource = paymentSources[0];
      setSelectedPaymentSourceId(firstPaymentSource.id);

      ref.current = true;
    }
  }, [paymentSources]);

  return (
    <section className="hero relative mb-0 mt-12 lg:mb-40 lg:mt-32 max-w-screen-xl mx-auto px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900">
          {isLoading ? (
            <ListSkeleton />
          ) : isError ? (
            <div className="py-8 text-center text-red-500">
              Error loading paymentSources.
            </div>
          ) : paymentSources ? (
            <PaymentSourcesList
              paymentSources={paymentSources}
              selectedPaymentSourceId={selectedPaymentSourceId}
              onSelect={setSelectedPaymentSourceId}
              onSave={handleSave}
              onAddNew={handleAddNew}
              newPaymentSource={newPaymentSource || undefined}
              onNewPaymentSourceChange={handleNewPaymentSourceChange}
              onSaveNew={handleSaveNew}
            />
          ) : null}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <PaymentSourceDetails
            handleSave={handleSave}
            handleDelete={handleDelete}
            newPaymentSource={newPaymentSource}
            selectedExistingPaymentSource={selectedExistingPaymentSource}
            setNewPaymentSource={setNewPaymentSource}
            isNewSelected={isNewSelected}
          />
        </div>
      </div>
    </section>
  );
}
