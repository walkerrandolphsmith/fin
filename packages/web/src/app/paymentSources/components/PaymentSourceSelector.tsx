import {
  AssignPaymentSourceDTO,
  BillDTO,
  PaymentSourceDTO,
} from "@fin/application";
import { PaymentSourceType } from "@fin/domain";
import { UseMutateAsyncFunction } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type PaymentSourceSelectorProps = {
  bill: Partial<BillDTO>;
  paymentSources: PaymentSourceDTO[];
  isLoadingSources: boolean;
  isFetched: boolean;
  onCreatePaymentSource: (dto: PaymentSourceDTO) => Promise<{
    created: PaymentSourceDTO;
    updatedBill: AssignPaymentSourceDTO;
  }>;
  isCreationPending: boolean;
  onAssignPaymentSource: UseMutateAsyncFunction<
    BillDTO,
    Error,
    string,
    unknown
  >;
  isAssigningSource: boolean;
};

export default function PaymentSourceSelector({
  bill,
  paymentSources,
  isLoadingSources,
  isFetched,
  onCreatePaymentSource,
  isCreationPending,
  onAssignPaymentSource,
}: PaymentSourceSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSourceName, setNewSourceName] = useState("");
  const [newSourceType, setNewSourceType] = useState<PaymentSourceType>(
    PaymentSourceType.CASH
  );

  useEffect(() => {
    if (isFetched && paymentSources.length === 0) {
      setIsCreating(true);
    }
  }, [isFetched, paymentSources]);

  const handleCreate = () => {
    if (!newSourceName.trim()) return;
    const dto: PaymentSourceDTO = {
      id: "",
      name: newSourceName.trim(),
      type: newSourceType,
      details: "",
    };
    onCreatePaymentSource(dto);
  };

  const formatTypeLabel = (type: PaymentSourceType): string =>
    type
      .split("_")
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(" ");

  if (isLoadingSources) {
    return (
      <div className="mt-4 text-gray-500 dark:text-gray-400">
        Loading payment sources...
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="">
        <div className="p-3 ">
          <div className="flex flex-col gap-2">
            <input
              type="text"
              placeholder="Payment Source Name"
              value={newSourceName}
              onChange={(e) => setNewSourceName(e.target.value)}
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={newSourceType}
              onChange={(e) =>
                setNewSourceType(e.target.value as PaymentSourceType)
              }
              className="px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Object.values(PaymentSourceType).map((type) => (
                <option key={type} value={type}>
                  {formatTypeLabel(type)}
                </option>
              ))}
            </select>

            <div className="flex gap-2 mt-2">
              <button
                onClick={handleCreate}
                disabled={isCreationPending}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                {isCreationPending ? "Creating..." : "Save & Assign"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <select
        value={bill.paymentSourceId ?? ""}
        onChange={(e) => onAssignPaymentSource(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="" disabled>
          Select payment source
        </option>
        {paymentSources.map((source) => (
          <option key={source.id} value={source.id}>
            {source.name}
          </option>
        ))}
      </select>

      <button
        onClick={() => setIsCreating(true)}
        className="mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline"
      >
        + Create New Payment Source
      </button>
    </div>
  );
}
