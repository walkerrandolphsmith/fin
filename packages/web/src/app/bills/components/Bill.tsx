"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BillDTO } from "@fin/application";
import { GripIcon } from "lucide-react";
import { ChangeEvent, useEffect, useRef } from "react";
import { useBillSelection } from "../context/BillSelectionContext";

interface BillProps {
  bill: BillDTO;
  localChanges?: Partial<BillDTO>;
  error: string | null;
  handleChangeLocal: (
    billId: string,
    field: "name" | "amount" | "dueDate",
    value: string | number
  ) => void;
  handleAmountChange: (billId: string) => Promise<void>;
  handleRename: (billId: string) => Promise<void>;
  handleAmountInput: (
    e: ChangeEvent<HTMLInputElement>,
    billId: string
  ) => void;
  amountRef: (el: HTMLInputElement | null) => void;
}

function toDisplayAmount(value: string | number | undefined): string {
  if (value === undefined || value === null || value === "") return "0.00";
  if (typeof value === "number") return value.toFixed(2);
  const digits = String(value).replace(/\D/g, "");
  return (parseInt(digits || "0", 10) / 100).toFixed(2);
}

export default function Bill({
  bill,
  localChanges,
  error,
  handleChangeLocal,
  handleAmountChange,
  handleRename,
  handleAmountInput,
  amountRef,
}: BillProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { selectedId, selectBill } = useBillSelection();
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: bill.id,
    });

  const isSelected = bill.id === selectedId;

  useEffect(() => {
    if (inputRef.current && isSelected) {
      inputRef.current.focus();
    }
  }, [isSelected, selectedId]);
  const displayBill = { ...bill, ...localChanges };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const dueFormatted = displayBill.dueDate
    ? new Date(displayBill.dueDate + "T00:00:00").toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
        }
      )
    : null;

  return (
    <div ref={setNodeRef} style={style}>
      <div
        onClick={() => selectBill(bill.id)}
        data-test-id="bill-row"
        className={`cursor-pointer group grid grid-cols-[20px_1fr_auto] items-center pr-4 transition-colors duration-150 ${
          error
            ? "bg-red-50 dark:bg-red-900/40"
            : isSelected
              ? "bg-blue-50 dark:bg-blue-900"
              : ""
        } ${dueFormatted || error ? "py-2" : "py-1.5"}`}
      >
        <div
          className="cursor-grab opacity-0 group-hover:opacity-100 w-4 h-4 pl-2"
          {...listeners}
          {...attributes}
        >
          <GripIcon className="text-gray-400 dark:text-gray-500" size={18} />
        </div>

        <div
          className={`min-h-10 ml-3 min-w-0 ${dueFormatted || error ? "flex flex-col" : "flex items-center"}`}
        >
          <input
            ref={inputRef}
            type="text"
            name="bill-name"
            data-test="bill-name-input"
            value={displayBill.name ?? ""}
            onFocus={() => selectBill(bill.id)}
            onChange={(e) =>
              handleChangeLocal(bill.id, "name", e.target.value)
            }
            onBlur={() => handleRename(bill.id)}
            className="text-gray-900 dark:text-white text-sm font-medium truncate bg-transparent px-1 py-0.5 rounded w-full hover:bg-gray-100 dark:hover:bg-gray-800"
          />
          {dueFormatted && !error && (
            <span className="ml-1 text-gray-500 dark:text-gray-400 text-xs leading-tight">
              Due: {dueFormatted}
            </span>
          )}
          {error && (
            <span className="ml-1 text-xs leading-tight text-red-600 dark:text-red-400">
              {error}
            </span>
          )}
        </div>

        <div className="text-right">
          <input
            ref={amountRef}
            type="text"
            inputMode="numeric"
            name="bill-amount"
            data-test="bill-amount-input"
            value={toDisplayAmount(displayBill.amount)}
            onFocus={() => selectBill(bill.id)}
            onChange={(e) => handleAmountInput(e, bill.id)}
            onBlur={() => handleAmountChange(bill.id)}
            className="font-medium text-gray-900 dark:text-gray-300 text-sm bg-transparent px-1 py-0.5 rounded w-20 text-right hover:bg-gray-100 dark:hover:bg-gray-800"
          />
        </div>
      </div>
    </div>
  );
}
