import { GripIcon } from "lucide-react";
import { forwardRef } from "react";
import { useBillSelection } from "../context/BillSelectionContext";

interface NewBillRowProps {
  onChange?: (
    field: "name" | "amount" | "dueDate",
    value: string | number
  ) => void;
  handleNewNameBlur: () => Promise<void>;
  onSelect?: (id: string) => void;
  newBillError?: string;
  isSavingNew?: boolean;
}

const CandidateBill = forwardRef<HTMLInputElement, NewBillRowProps>(
  ({ onChange, handleNewNameBlur, newBillError, isSavingNew }, ref) => {
    const { selectBill, newBillData } = useBillSelection();
    return (
      <div
        className={`py-2 group grid grid-cols-[20px_1fr_auto] items-center pr-4 transition-colors duration-150 cursor-pointer ${
          newBillError
            ? "bg-red-50 dark:bg-red-900/40"
            : isSavingNew
              ? "bg-green-50 dark:bg-green-900/40 opacity-75"
              : "bg-blue-50 dark:bg-blue-900/40"
        }`}
        onClick={() => selectBill(newBillData.id)}
      >
        <div className="cursor-grab opacity-0 group-hover:opacity-100 w-4 h-4 pl-2">
          <GripIcon className="text-gray-400 dark:text-gray-500" size={18} />
        </div>
        <div className="ml-3 flex flex-col min-w-0">
          <input
            ref={ref}
            disabled={isSavingNew}
            type="text"
            value={newBillData.name ?? ""}
            onFocus={() => selectBill(newBillData.id)}
            onChange={(e) => onChange("name", e.target.value)}
            onBlur={handleNewNameBlur}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleNewNameBlur();
              }
            }}
            className="text-gray-900 dark:text-white text-sm font-medium truncate bg-transparent px-1 py-0.5 rounded w-full hover:bg-gray-100 dark:hover:bg-gray-800"
            placeholder="New bill name"
          />
        </div>
        <div className="text-right">
          <input
            disabled
            type="text"
            inputMode="numeric"
            className="font-medium text-gray-900 dark:text-gray-300 text-sm bg-transparent px-1 py-0.5 rounded w-20 text-right hover:bg-gray-100 dark:hover:bg-gray-800"
            placeholder="0.00"
          />
        </div>
        {newBillError && (
          <div className="col-span-3 text-red-600 dark:text-red-400 text-xs mt-1 ml-[32px]">
            {newBillError}
          </div>
        )}
        {isSavingNew && (
          <div className="col-span-3 text-green-600 dark:text-green-400 text-xs mt-1 ml-[32px]">
            Saving your bill...
          </div>
        )}
      </div>
    );
  }
);

CandidateBill.displayName = "CandidateBill";
export default CandidateBill;
