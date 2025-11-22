"use client";

import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { BillDTO, RenameBillDTO, SetBillAmountDTO } from "@fin/application";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useBillSelection } from "../context/BillSelectionContext";
import { useBills } from "../hooks/useBills";
import Bill from "./Bill";
import CandidateBill from "./CandidateBill";

interface BillsListProps {
  bills: BillDTO[];
  billsState: ReturnType<typeof useBills>;
  setModalOpen: (open: boolean) => void;
}

export default function BillsList({
  bills,
  billsState,
  setModalOpen,
}: BillsListProps) {
  const {
    selectBill,
    startCreatingNew,
    isCreatingNew,
    newBillData,
    updateNewBillData,
    cancelCreatingNew,
  } = useBillSelection();

  const [editingChanges, setEditingChanges] = useState<
    Record<string, Partial<BillDTO>>
  >({});
  const [errorStates, setErrorStates] = useState<
    Record<string, string | null>
  >({});
  const [newBillError, setNewBillError] = useState<string | null>(null);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const amountRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [focusTargetId, setFocusTargetId] = useState<string | null>(null);
  const orderedBills = [...bills].sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0)
  );
  useEffect(() => {
    if (isCreatingNew && newBillData && nameInputRef.current) {
      selectBill(newBillData.id);
      nameInputRef.current.focus();
    }
  }, [isCreatingNew, newBillData, selectBill]);

  useEffect(() => {
    if (!focusTargetId) return;
    const el = amountRefs.current[focusTargetId];
    if (el) {
      setTimeout(() => el.focus(), 0);
      setFocusTargetId(null);
    }
  }, [focusTargetId]);

  const handleChangeLocal = (
    billId: string,
    field: "name" | "amount" | "dueDate",
    value: string | number
  ) => {
    setEditingChanges((prev) => ({
      ...prev,
      [billId]: { ...prev[billId], [field]: value },
    }));
  };

  const handleAmountInput = (
    e: ChangeEvent<HTMLInputElement>,
    billId: string
  ) => {
    const digits = e.target.value.replace(/\D/g, "");
    const numericValue = (parseInt(digits || "0", 10) / 100).toFixed(2);
    handleChangeLocal(billId, "amount", numericValue);
  };

  const handleAmountChange = async (billId: string) => {
    const changes = editingChanges[billId];
    if (!changes?.amount) return;

    const dto: SetBillAmountDTO = {
      id: billId,
      mutationType: "setAmount",
      amount: Number(changes.amount),
    };

    setEditingChanges((prev) => {
      const next = { ...prev };
      if (next[billId]) {
        delete next[billId].amount;
        if (Object.keys(next[billId]).length === 0) delete next[billId];
      }
      return next;
    });

    setErrorStates((prev) => ({ ...prev, [billId]: null }));

    try {
      await billsState.updateBill({ id: billId, data: dto });
    } catch (error) {
      console.error("Failed to update amount", error);
      setEditingChanges((prev) => ({
        ...prev,
        [billId]: { ...prev[billId], amount: changes.amount },
      }));
      setErrorStates((prev) => ({
        ...prev,
        [billId]: "Failed to save amount",
      }));

      setTimeout(() => {
        setErrorStates((prev) => ({ ...prev, [billId]: null }));
      }, 3000);
    }
  };

  const handleRename = async (billId: string) => {
    const changes = editingChanges[billId];
    if (!changes?.name) return;

    const dto: RenameBillDTO = {
      id: billId,
      name: changes.name,
      mutationType: "rename",
    };

    setEditingChanges((prev) => {
      const next = { ...prev };
      if (next[billId]) {
        delete next[billId].name;
        if (Object.keys(next[billId]).length === 0) delete next[billId];
      }
      return next;
    });

    setErrorStates((prev) => ({ ...prev, [billId]: null }));

    try {
      await billsState.updateBill({ id: billId, data: dto });
    } catch (error) {
      console.error("Failed to rename", error);
      setEditingChanges((prev) => ({
        ...prev,
        [billId]: { ...prev[billId], name: changes.name },
      }));
      setErrorStates((prev) => ({ ...prev, [billId]: "Failed to save name" }));

      setTimeout(() => {
        setErrorStates((prev) => ({ ...prev, [billId]: null }));
      }, 3000);
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedBills.findIndex((b) => b.id === active.id);
    const newIndex = orderedBills.findIndex((b) => b.id === over.id);
    const newOrder = arrayMove(orderedBills, oldIndex, newIndex);

    try {
      await billsState.reorderBills(newOrder);
    } catch (err) {
      console.error("Failed to persist bill order", err);
    }
  };

  const handleNewBillChange = (
    field: "name" | "amount" | "dueDate",
    value: string | number
  ) => {
    updateNewBillData({ [field]: value });
  };

  const handleNewNameBlur = async () => {
    if (!newBillData?.name?.trim()) return;

    setIsSavingNew(true);
    setNewBillError(null);

    try {
      const created = await billsState.createBill(newBillData);

      setFocusTargetId(created.id);
      cancelCreatingNew();
      selectBill(created.id);
    } catch (err) {
      console.error("Failed to save new bill", err);
      setNewBillError(
        "Couldn't save bill. Check your connection or try again."
      );
      requestAnimationFrame(() => {
        nameInputRef.current?.focus();
      });
    } finally {
      setIsSavingNew(false);
    }
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedBills.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {orderedBills.map((bill) => {
            const localChanges = editingChanges[bill.id];
            const error = errorStates[bill.id];

            return (
              <Bill
                key={bill.id}
                bill={bill}
                localChanges={localChanges}
                error={error ?? null}
                handleChangeLocal={handleChangeLocal}
                handleAmountChange={handleAmountChange}
                handleRename={handleRename}
                handleAmountInput={handleAmountInput}
                amountRef={(el) => {
                  amountRefs.current[bill.id] = el;
                }}
              />
            );
          })}
        </SortableContext>
      </DndContext>

      {isCreatingNew && newBillData && (
        <CandidateBill
          ref={nameInputRef}
          onChange={handleNewBillChange}
          handleNewNameBlur={handleNewNameBlur}
          newBillError={newBillError}
          isSavingNew={isSavingNew}
        />
      )}

      <div className="flex w-full justify-between">
        <button
          onClick={startCreatingNew}
          className="my-4 ml-8 cursor-pointer text-blue-600 dark:text-blue-400 text-sm hover:underline active:text-blue-800 dark:active:text-blue-200"
        >
          + Add Item
        </button>
        <button
          className="my-4 mr-8 cursor-pointer text-blue-600 dark:text-blue-400 text-sm hover:underline active:text-blue-800 dark:active:text-blue-200"
          onClick={() => setModalOpen(true)}
        >
          Import Bill
        </button>
      </div>
    </div>
  );
}
