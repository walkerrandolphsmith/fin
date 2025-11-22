"use client";

import {
  ChangeTypePaymentSourceDTO,
  PaymentSourceDTO,
  RenamePaymentSourceDTO,
  UpdatePaymentSourceDTO,
} from "@fin/application";
import { useEffect, useRef, useState } from "react";
import CandidatePaymentSource from "./CandidatePaymentSource";
import PaymentSource from "./PaymentSource";

interface PaymentSourcesListProps {
  paymentSources: PaymentSourceDTO[];
  selectedPaymentSourceId: string | null;
  onSelect: (id: string) => void;
  onSave: (
    paymentSourceId: string,
    data: UpdatePaymentSourceDTO
  ) => Promise<PaymentSourceDTO>;
  onAddNew: () => void;
  onReorder?: (newOrder: PaymentSourceDTO[]) => void;
  newPaymentSource?: Partial<PaymentSourceDTO>;
  onNewPaymentSourceChange?: (
    field: "name" | "type" | "details",
    value: string | number
  ) => void;
  onSaveNew?: (
    data: Partial<PaymentSourceDTO>
  ) => Promise<PaymentSourceDTO | null>;
}

export default function PaymentSourcesList({
  paymentSources,
  selectedPaymentSourceId,
  onSelect,
  onSave,
  onAddNew,
  newPaymentSource,
  onNewPaymentSourceChange,
  onSaveNew,
}: PaymentSourcesListProps) {
  const [localPaymentSources, setLocalPaymentSources] = useState<
    Record<string, PaymentSourceDTO>
  >({});

  useEffect(() => {
    const init: Record<string, PaymentSourceDTO> = {};
    paymentSources.forEach((dto) => {
      init[dto.id] = dto;
    });
    setLocalPaymentSources(init);
  }, [paymentSources]);

  const typeRefs = useRef<Record<string, HTMLSelectElement | null>>({});
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);

  useEffect(() => {
    if (newPaymentSource && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [newPaymentSource]);

  useEffect(() => {
    if (!focusTargetId) return;
    const el = typeRefs.current[focusTargetId];
    if (el) {
      setTimeout(() => el.focus(), 0);
      setFocusTargetId(null);
    }
  }, [focusTargetId]);

  const handleChangeLocal = (
    paymentSourceId: string,
    field: "name" | "type",
    value: string
  ) => {
    setLocalPaymentSources((prev) => ({
      ...prev,
      [paymentSourceId]: { ...prev[paymentSourceId], [field]: value },
    }));
  };

  const handleTypeChange = async (paymentSourceId: string) => {
    const updated = localPaymentSources[paymentSourceId];
    if (!updated) return;
    const dto: ChangeTypePaymentSourceDTO = {
      id: paymentSourceId,
      mutationType: "changeType",
      type: updated?.type,
    };
    const saved: PaymentSourceDTO = await onSave(paymentSourceId, dto);

    setLocalPaymentSources((prev) => ({ ...prev, [paymentSourceId]: saved }));
  };

  const handleRename = async (paymentSourceId: string) => {
    const updated = localPaymentSources[paymentSourceId];
    if (!updated) return;
    const dto: RenamePaymentSourceDTO = {
      id: paymentSourceId,
      mutationType: "rename",
      name: updated?.name ?? "",
    };
    const saved: PaymentSourceDTO = await onSave(paymentSourceId, dto);

    setLocalPaymentSources((prev) => ({ ...prev, [paymentSourceId]: saved }));
  };

  const handleNewNameBlur = async () => {
    if (!newPaymentSource?.name?.trim() || !onSaveNew) return;
    const created = await onSaveNew(newPaymentSource);
    if (!created) return;

    setLocalPaymentSources((prev) => ({ ...prev, [created.id]: created }));
    setFocusTargetId(created.id);
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {paymentSources.map((paymentSource) => (
        <PaymentSource
          key={paymentSource.id}
          paymentSource={paymentSource}
          local={localPaymentSources[paymentSource.id]}
          isSelected={paymentSource.id === selectedPaymentSourceId}
          handleChangeLocal={handleChangeLocal}
          handleTypeChange={handleTypeChange}
          handleRename={handleRename}
          onSelect={onSelect}
          typeRef={(el) => {
            typeRefs.current[paymentSource.id] = el;
          }}
        />
      ))}

      {newPaymentSource && (
        <CandidatePaymentSource
          newPaymentSource={newPaymentSource}
          onSelect={onSelect}
          onNewPaymentSourceChange={onNewPaymentSourceChange}
          nameInputRef={nameInputRef}
          handleNewNameBlur={handleNewNameBlur}
        />
      )}

      <button
        onClick={onAddNew}
        className="my-4 ml-8 cursor-pointer text-blue-600 dark:text-blue-400 text-sm hover:underline active:text-blue-800 dark:active:text-blue-200"
      >
        + Add Payment Source
      </button>
    </div>
  );
}
