import { PaymentSourceDTO } from "@fin/application";
import { PaymentSourceType } from "@fin/domain";
import { useEffect, useRef } from "react";

interface PaymentSourceProps {
  paymentSource: PaymentSourceDTO;
  local: PaymentSourceDTO;
  isSelected: boolean;
  handleChangeLocal: (
    paymentSourceId: string,
    field: "name" | "type",
    value: string
  ) => void;
  handleRename: (paymentSourceId: string) => Promise<void>;
  onSelect: (id: string) => void;
  handleTypeChange: (paymentSourceId: string) => Promise<void>;
  typeRef: (e: HTMLSelectElement) => void;
}

export default function PaymentSource({
  paymentSource,
  local,
  isSelected,
  handleChangeLocal,
  handleRename,
  handleTypeChange,
  onSelect,
  typeRef,
}: PaymentSourceProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isSelected && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isSelected]);
  return (
    <div>
      <div
        className={`group grid grid-cols-[1fr_auto] items-center px-4 transition-colors duration-150 h-12 ${
          isSelected ? "bg-blue-50 dark:bg-blue-900" : ""
        } "py-1.5"`}
      >
        <div className={`min-w-0`}>
          <input
            ref={inputRef}
            type="text"
            value={local?.name ?? ""}
            onFocus={() => onSelect(paymentSource.id)}
            onChange={(e) =>
              handleChangeLocal(paymentSource.id, "name", e.target.value)
            }
            onBlur={() => handleRename(paymentSource.id)}
            className="text-gray-900 dark:text-white text-sm font-medium truncate bg-transparent px-1 py-0.5 rounded w-full hover:bg-gray-100 dark:hover:bg-gray-800"
          />
        </div>
        <div className="text-right">
          <select
            ref={typeRef}
            value={local?.type ?? ""}
            onFocus={() => onSelect(paymentSource.id)}
            onChange={(e) =>
              handleChangeLocal(paymentSource.id, "type", e.target.value)
            }
            onBlur={() => handleTypeChange(paymentSource.id)}
            className="font-medium text-gray-900 dark:text-gray-300 text-sm bg-transparent px-1 py-0.5 rounded text-right hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.values(PaymentSourceType).map((type) => (
              <option
                key={type}
                value={type}
                className="text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-900"
              >
                {type
                  .replace("_", " ")
                  .toLowerCase()
                  .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
