"use client";

import { BillDTO } from "@fin/application";
import { BillsSDK } from "@fin/sdk";
import { useRef, useState } from "react";

export default function ImportBillWizard() {
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
    try {
      await BillsSDK.createBill(parsedData!);
      setStep("idle");
      setParsedData(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save bill");
    }
  }

  return (
    <div className="p-4 border rounded-xl bg-white dark:bg-gray-900 max-w-xl mx-auto">
      {step === "idle" && (
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold">Import a Bill</h2>
          <p>Select a PDF and we will extract the details for you.</p>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            onClick={() => fileInputRef.current?.click()}
          >
            Select PDF
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelected}
          />
        </div>
      )}

      {step === "processing" && (
        <div className="animate-pulse space-y-6">
          <h2 className="text-xl font-semibold">Processing Document…</h2>
          <p className="text-gray-500">
            Extracting bill details. This may take a few seconds.
          </p>

          {/* Skeleton UI (TurboTax-like loading cards) */}
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      )}

      {step === "review" && parsedData && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Review Extracted Details</h2>
          <p className="text-gray-500">
            Modify anything that looks incorrect.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Bill Name</label>
              <input
                className="w-full p-2 rounded border dark:bg-gray-800"
                value={parsedData.name || ""}
                onChange={(e) =>
                  setParsedData((d) => ({ ...d!, name: e.target.value }))
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Amount</label>
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
              <label className="block text-sm font-medium">Due Date</label>
              <input
                type="date"
                className="w-full p-2 rounded border dark:bg-gray-800"
                value={parsedData.dueDate?.slice(0, 10) || ""}
                onChange={(e) =>
                  setParsedData((d) => ({ ...d!, dueDate: e.target.value }))
                }
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Payment Portal</label>
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

          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 w-full"
            onClick={finalizeImport}
          >
            Create bill
          </button>
        </div>
      )}
    </div>
  );
}
