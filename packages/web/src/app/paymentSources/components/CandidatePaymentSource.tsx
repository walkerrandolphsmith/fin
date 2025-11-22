import { PaymentSourceDTO } from "@fin/application";
import { RefObject } from "react";

interface CandidatePaymentSourceProps {
  newPaymentSource: Partial<PaymentSourceDTO>;
  onSelect: (id: string) => void;
  onNewPaymentSourceChange: (
    field: "name" | "type" | "details",
    value: string | number
  ) => void;
  nameInputRef: RefObject<HTMLInputElement>;
  handleNewNameBlur: () => Promise<void>;
}

export default function CandidatePaymentSource({
  newPaymentSource,
  onSelect,
  onNewPaymentSourceChange,
  nameInputRef,
  handleNewNameBlur,
}: CandidatePaymentSourceProps) {
  return (
    <div
      className="grid grid-cols-[1fr_auto] items-center py-2 px-4 bg-blue-50 dark:bg-blue-900/40 cursor-pointer h-12"
      onClick={() => onSelect(newPaymentSource.id)}
    >
      <div className="flex flex-col min-w-0">
        <input
          ref={nameInputRef}
          type="text"
          value={newPaymentSource.name ?? ""}
          onChange={(e) => onNewPaymentSourceChange?.("name", e.target.value)}
          onBlur={handleNewNameBlur}
          className="text-gray-900 dark:text-white text-sm font-medium truncate bg-transparent px-1 py-0.5 rounded w-full hover:bg-gray-100 dark:hover:bg-gray-800"
          placeholder="Nickname of the payment source"
        />
      </div>
      <div className="text-right">
        <select
          value={newPaymentSource.type}
          className="font-medium text-gray-900 dark:text-gray-300 text-sm bg-transparent px-1 py-0.5 rounded text-right hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option
            key={newPaymentSource.type}
            value={newPaymentSource.type}
            className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
          >
            {newPaymentSource.type
              .replace("_", " ")
              .toLowerCase()
              .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
          </option>
        </select>
      </div>
    </div>
  );
}
