"use client";

import { BillDTO } from "@fin/application";
import { BillsSDK } from "@fin/sdk";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useRef, useState } from "react";

interface ImportBillModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ImportBillModal({
  isOpen,
  onClose,
}: ImportBillModalProps) {
  type Step = "idle" | "processing" | "review";

  const [step, setStep] = useState<Step>("idle");
  const [parsedData, setParsedData] = useState<BillDTO | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setStep("processing");

    try {
      const result = await BillsSDK.importFrom(file);
      setParsedData(result);
      setStep("review");
    } catch (err) {
      console.error(err);
      alert("Failed to import bill");
      setStep("idle");
    } finally {
      e.target.value = "";
    }
  }

  async function finalizeImport() {
    if (!parsedData) return;
    try {
      await BillsSDK.createBill(parsedData);
      alert("Bill imported!");
      setStep("idle");
      setParsedData(null);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save bill");
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto w-full max-w-xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg">
              <Dialog.Title className="text-xl font-semibold">
                {step === "idle" && "Import a Bill"}
                {step === "processing" && "Processing Document…"}
                {step === "review" && "Review Extracted Details"}
              </Dialog.Title>

              <div className="mt-4">
                {/* IDLE STEP: File selection */}
                {step === "idle" && (
                  <div className="space-y-4">
                    <p>
                      Select a PDF and we will extract the details for you.
                    </p>
                    <div className="w-full justify-end flex mt-24">
                      <button
                        type="button"
                        className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Select PDF
                      </button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={handleFileSelected}
                    />
                  </div>
                )}

                {/* PROCESSING STEP: Skeleton */}
                {step === "processing" && (
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                  </div>
                )}

                {/* REVIEW STEP: Editable form */}
                {step === "review" && parsedData && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium">
                        Bill Name
                      </label>
                      <input
                        className="w-full p-2 rounded border dark:bg-gray-800"
                        value={parsedData.name || ""}
                        onChange={(e) =>
                          setParsedData((d) => ({
                            ...d!,
                            name: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Amount
                      </label>
                      <input
                        type="number"
                        className="w-full p-2 rounded border dark:bg-gray-800"
                        value={parsedData.amount ?? ""}
                        onChange={(e) =>
                          setParsedData((d) => ({
                            ...d!,
                            amount: parseFloat(e.target.value),
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Due Date
                      </label>
                      <input
                        type="date"
                        className="w-full p-2 rounded border dark:bg-gray-800"
                        value={parsedData.dueDate?.slice(0, 10) || ""}
                        onChange={(e) =>
                          setParsedData((d) => ({
                            ...d!,
                            dueDate: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Payment Portal
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 rounded border dark:bg-gray-800"
                        value={parsedData.paymentPortalUrl ?? ""}
                        onChange={(e) =>
                          setParsedData((d) => ({
                            ...d!,
                            paymentPortalUrl: e.target.value,
                          }))
                        }
                      />
                    </div>

                    <div>
                      <button
                        type="button"
                        className="cursor-pointer px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                        onClick={() => {
                          setStep("idle");
                          setParsedData(null);
                        }}
                      >
                        Choose a Different File
                      </button>
                    </div>

                    <button
                      className="cursor-pointer mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={finalizeImport}
                    >
                      Create Bill
                    </button>
                  </div>
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
