import { ClearBillDueDateDTO, SetBillDueDateDTO } from "@fin/application";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export default function DueDateSelector({
  bill,
  handleSave,
  setOpenAccordionItem,
}) {
  const [selected, setSelected] = useState<Date | undefined>(() => {
    if (!bill.dueDate) return undefined;
    const [year, month, day] = bill.dueDate.split("-").map(Number);
    return new Date(year, month - 1, day);
  });
  const [isReoccurring, setIsReoccurring] = useState<boolean>(
    bill.isReoccurring ?? true
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!bill.dueDate) {
      setSelected(undefined);
    } else {
      const [year, month, day] = bill.dueDate.split("-").map(Number);
      setSelected(new Date(year, month - 1, day));
    }
    setIsReoccurring(bill.isReoccurring ?? false);
  }, [bill.dueDate, bill.isReoccurring]);

  const handleSaveClick = async () => {
    if (!selected) return;

    try {
      setIsSaving(true);

      const dto: SetBillDueDateDTO = {
        id: bill.id,
        mutationType: "setDueDate",
        selectedMonth: selected.getMonth(),
        selectedDay: selected.getDate(),
        isReoccurring,
      };
      await handleSave({ id: bill.id, data: dto });
      setOpenAccordionItem(undefined);
    } catch (error) {
      console.error(error);
      setSaveError("There was an issue saving the due date");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearClick = async () => {
    try {
      setIsSaving(true);
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const dto: ClearBillDueDateDTO = {
        id: bill.id,
        mutationType: "clearDueDate",
      };
      await handleSave({ id: bill.id, data: dto });
      setOpenAccordionItem(undefined);
    } catch (error) {
      console.error(error);
      setSaveError("There was an issue clearing the due date");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full mb-4 flex items-center space-x-3">
        <input
          type="checkbox"
          id="recurring"
          checked={isReoccurring}
          onChange={(e) => setIsReoccurring(e.target.checked)}
          className="w-5 h-5 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
        />
        <label
          htmlFor="recurring"
          className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none"
        >
          Make this a recurring bill
        </label>
      </div>

      <div className="w-full">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={setSelected}
          className="rdp-custom w-full"
          modifiersClassNames={{
            selected: "bg-blue-600 text-white hover:bg-blue-700",
            today: "font-bold text-blue-600",
          }}
        />
      </div>

      <button
        onClick={handleSaveClick}
        disabled={!selected || isSaving}
        className="cursor-pointer disabled:cursor-default w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
      >
        Save Due Date
      </button>

      {bill.dueDate && !isSaving && (
        <button
          onClick={handleClearClick}
          className="cursor-pointer mt-4 w-full border border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Clear Date
        </button>
      )}

      {isSaving && (
        <div className="col-span-3 text-green-600 dark:text-green-400 text-xs mt-2">
          Saving due date bill...
        </div>
      )}

      {saveError && (
        <div className="col-span-3 text-red-600 dark:text-red-400 text-xs mt-2">
          {saveError}
        </div>
      )}

      <style jsx global>{`
        .rdp-custom {
          --rdp-cell-size: 32px;
          --rdp-accent-color: #2563eb;
          --rdp-background-color: #dbeafe;
          --rdp-day_button-width: 32px;
          --rdp-day_button-height: 32px;
          font-family:
            system-ui,
            -apple-system,
            sans-serif;
          width: 100%;
        }

        .rdp-custom .rdp-months {
          width: 100%;
        }

        .rdp-custom .rdp-month {
          width: 100%;
        }

        .rdp-custom .rdp-table {
          width: 100%;
          max-width: 100%;
        }

        .rdp-custom .rdp-day,
        .rdp-custom .rdp-head_cell {
          width: 10.28%; /* 100% / 7 days */
          max-width: 32px;
        }

        .rdp-custom .rdp-day_selected:not([disabled]) {
          background-color: #2563eb;
          color: white;
        }

        .rdp-custom .rdp-day_selected:hover:not([disabled]) {
          background-color: #1d4ed8;
        }

        .rdp-custom
          .rdp-day:hover:not([disabled]):not([data-selected="true"]) {
          background-color: #f3f4f6;
        }

        .rdp-custom .rdp-day_today:not(.rdp-day_selected) {
          font-weight: bold;
          color: #2563eb;
        }

        .rdp-custom .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #f3f4f6;
        }

        .rdp-custom .rdp-head_cell {
          font-weight: 600;
          font-size: 0.875rem;
          color: #6b7280;
        }

        .rdp-custom .rdp-caption {
          font-weight: 600;
          color: #1f2937;
        }

        /* Dark mode support */
        .dark .rdp-custom {
          --rdp-background-color: #1e3a8a;
        }

        .dark
          .rdp-custom
          .rdp-day:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #374151;
        }

        .dark
          .rdp-custom
          .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
          background-color: #374151;
        }

        .dark .rdp-custom .rdp-head_cell {
          color: #9ca3af;
        }

        .dark .rdp-custom .rdp-caption {
          color: #f9fafb;
        }
      `}</style>
    </div>
  );
}
