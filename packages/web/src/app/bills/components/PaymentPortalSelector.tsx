import { BillDTO, SetPaymentPortalDTO, UpdateBillDTO } from "@fin/application";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface PaymentPortalSelectorProps {
  bill: Partial<BillDTO>;
  handleSave: UseMutateAsyncFunction<
    BillDTO,
    Error,
    {
      id: string;
      data: UpdateBillDTO;
    },
    unknown
  >;
  setOpenAccordionItem: Dispatch<SetStateAction<string | undefined>>;
}

export default function PaymentPortalSelector({
  bill,
  handleSave,
  setOpenAccordionItem,
}: PaymentPortalSelectorProps) {
  const [url, setUrl] = useState(bill.paymentPortalUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUrl = (input: string): boolean => {
    if (!input) return true;
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async () => {
    setError(null);

    if (url && !validateUrl(url)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      return;
    }

    setIsSaving(true);
    try {
      const dto: SetPaymentPortalDTO = {
        id: bill.id,
        mutationType: "setPaymentPortal",
        paymentPortalUrl: url || undefined,
      };
      await handleSave({ id: bill.id, data: dto });
      setOpenAccordionItem(undefined);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save payment portal"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    setUrl("");
    setError(null);
    setIsSaving(true);
    try {
      const dto: SetPaymentPortalDTO = {
        id: bill.id,
        mutationType: "setPaymentPortal",
        paymentPortalUrl: undefined,
      };
      await handleSave({ id: bill.id, data: dto });
      setOpenAccordionItem(undefined);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear payment portal"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenPortal = () => {
    if (bill.paymentPortalUrl) {
      window.open(bill.paymentPortalUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="portal-url"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          Payment Portal URL
        </label>
        <input
          id="portal-url"
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          placeholder="https://example.com/pay"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          disabled={isSaving}
        />
        {error && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        {!bill.paymentPortalUrl && (
          <button
            onClick={handleSubmit}
            disabled={isSaving || url === bill.paymentPortalUrl}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        )}

        {bill.paymentPortalUrl && (
          <div className="flex flex-col w-full">
            <button
              onClick={handleOpenPortal}
              className="flex items-center justify-center cursor-pointer mt-4 w-full border bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              title="Open payment portal"
            >
              <ExternalLink size={18} className="mr-2 " />
              Open
            </button>

            <button
              onClick={handleClear}
              disabled={isSaving}
              className="cursor-pointer mt-4 w-full border border-blue-500 text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/50 px-4 py-2 rounded-lg font-medium transition-colors"
              title="Clear"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
