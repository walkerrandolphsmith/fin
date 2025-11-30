import { SetAmountTypeDTO } from "@fin/application";
import { useEffect, useState } from "react";

export default function AmountTypeSelector({
  bill,
  handleSave,
  setOpenAccordionItem,
}) {
  const [hasFixedAmount, setHasFixedAmount] = useState<boolean>(
    bill.hasFixedAmount ?? true
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setHasFixedAmount(bill.hasFixedAmount ?? true);
  }, [bill.hasFixedAmount]);

  const handleSaveClick = async () => {
    try {
      setIsSaving(true);

      const dto: SetAmountTypeDTO = {
        id: bill.id,
        mutationType: "setAmountType",
        hasFixedAmount,
      };
      await handleSave({ id: bill.id, data: dto });
      setOpenAccordionItem(undefined);
    } catch (error) {
      console.error(error);
      setSaveError("There was an issue saving the amount type");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="w-full mb-6 space-y-3">
        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="fixed"
            name="amountType"
            checked={hasFixedAmount === true}
            onChange={() => setHasFixedAmount(true)}
            className="w-5 h-5 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
          <label htmlFor="fixed" className="cursor-pointer select-none flex-1">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Fixed Amount
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Same amount each time (e.g., rent, subscriptions)
            </div>
          </label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="radio"
            id="variable"
            name="amountType"
            checked={hasFixedAmount === false}
            onChange={() => setHasFixedAmount(false)}
            className="w-5 h-5 text-blue-600 bg-white border-gray-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
          />
          <label
            htmlFor="variable"
            className="cursor-pointer select-none flex-1"
          >
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Variable Amount
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Amount changes each time (e.g., utilities, credit cards)
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={handleSaveClick}
        disabled={isSaving}
        className="cursor-pointer disabled:cursor-default w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors"
      >
        Save Amount Type
      </button>

      {isSaving && (
        <div className="text-green-600 dark:text-green-400 text-xs mt-2">
          Saving amount type...
        </div>
      )}

      {saveError && (
        <div className="text-red-600 dark:text-red-400 text-xs mt-2">
          {saveError}
        </div>
      )}
    </div>
  );
}
