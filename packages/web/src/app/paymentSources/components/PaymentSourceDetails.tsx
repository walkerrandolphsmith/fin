import { PaymentSourceDTO, UpdatePaymentSourceDTO } from "@fin/application";
import { Dispatch, SetStateAction } from "react";

interface PaymentSourceProps {
  isNewSelected: boolean;
  newPaymentSource?: Partial<PaymentSourceDTO>;
  setNewPaymentSource: Dispatch<
    SetStateAction<Partial<PaymentSourceDTO> & { id: string }>
  >;
  selectedExistingPaymentSource: PaymentSourceDTO;
  handleSave: (
    paymentSourceId: string,
    data: UpdatePaymentSourceDTO
  ) => Promise<PaymentSourceDTO>;
  handleDelete: (paymentSourceId: string) => Promise<void>;
}

export default function PaymentSourceDetails({
  isNewSelected,
  newPaymentSource,
  selectedExistingPaymentSource,
  handleDelete,
}: PaymentSourceProps) {
  const paymentSource = isNewSelected
    ? newPaymentSource
    : selectedExistingPaymentSource;

  if (!paymentSource)
    return (
      <div className="min-h-[380px]">
        <p className="text-gray-600 dark:text-gray-300 text-center mt-8">
          Select a payment source to see details
        </p>
      </div>
    );

  return (
    <div>
      <div className="mb-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isNewSelected ? "New PaymentSource" : paymentSource.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {paymentSource.type}
        </p>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 mb-4" />

      {!isNewSelected && (
        <div className="p-6">
          <button
            onClick={() => handleDelete(paymentSource.id)}
            className="cursor-pointer mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full transition-colors font-medium"
          >
            Delete Payment Source
          </button>
        </div>
      )}
    </div>
  );
}
