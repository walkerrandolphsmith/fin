"use client";

import PaymentSourceSelector from "@/app/paymentSources/components/PaymentSourceSelector";
import { PaymentSourceDTO } from "@fin/application";
import * as Accordion from "@radix-ui/react-accordion";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronDownIcon,
  CircleDollarSign,
  ExternalLink,
  VariableIcon,
} from "lucide-react";
import { useState } from "react";
import "react-day-picker/dist/style.css";
import { useBillSelection } from "../context/BillSelectionContext";
import { useBills } from "../hooks/useBills";
import { usePaymentSources } from "../hooks/usePaymentSources";
import AmountTypeSelector from "./AmountTypeSelector";
import DueDateSelector from "./DueDateSelector";
import PaymentPortalSelector from "./PaymentPortalSelector";

interface BillDetailsProps {
  billsState: ReturnType<typeof useBills>;
}

export default function BillDetails({ billsState }: BillDetailsProps) {
  const { selectedBill, isCreatingNew, newBillData, cancelCreatingNew } =
    useBillSelection();

  const paymentSourcesState = usePaymentSources();
  const [openAccordionItem, setOpenAccordionItem] = useState<
    string | undefined
  >();

  const bill = isCreatingNew ? newBillData : selectedBill;

  if (!bill) {
    return (
      <div className="min-h-[380px]">
        <p className="text-gray-600 dark:text-gray-300 text-center mt-8">
          Select a bill to see details
        </p>
      </div>
    );
  }

  const amountType = bill.hasFixedAmount ? "Fixed Amount" : "Variable Amount";

  const formattedDate = bill.dueDate
    ? (() => {
        const [year, month, day] = bill.dueDate.split("-").map(Number);
        return format(new Date(year, month - 1, day), "MMM do");
      })()
    : "Set date";

  const selectedFundName =
    paymentSourcesState.paymentSources.find(
      (p) => p.id === bill.paymentSourceId
    )?.name ?? "Assign payment source";

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this bill?")) return;
    await billsState.deleteBill(bill.id);
  };

  const handleCreatePaymentSource = async (dto: PaymentSourceDTO) => {
    return await paymentSourcesState.createAndAssign({
      paymentSourceDto: dto,
      billId: bill.id,
    });
  };

  const handleAssignPaymentSource = async (paymentSourceId: string) => {
    return await paymentSourcesState.assign({
      billId: bill.id,
      paymentSourceId,
    });
  };

  return (
    <div>
      <div className="mb-4 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isCreatingNew ? "New Bill" : bill.name}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Amount: ${bill.amount?.toFixed(2) ?? "0.00"}
        </p>
      </div>

      <hr className="border-gray-200 dark:border-gray-700 mb-4" />

      {/*  */}

      <Accordion.Root
        type="single"
        collapsible
        className="w-full space-y-3"
        value={openAccordionItem}
        onValueChange={setOpenAccordionItem}
      >
        <Accordion.Item value="due-date" className="overflow-hidden">
          <AccordionTrigger icon={<CalendarIcon size={24} />}>
            <div className="flex flex-col items-start">
              <div className="font-medium">Due Date</div>
              <div className="text-sm text-blue-600">{formattedDate}</div>
            </div>
          </AccordionTrigger>
          <Accordion.Content>
            <div className="p-8">
              <DueDateSelector
                bill={bill}
                handleSave={billsState.updateBill}
                setOpenAccordionItem={setOpenAccordionItem}
              />
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="amount-type" className="overflow-hidden">
          <AccordionTrigger icon={<VariableIcon size={24} />}>
            <div className="flex flex-col items-start">
              <div className="font-medium">Amount Type</div>
              <div className="text-sm text-blue-600">{amountType}</div>
            </div>
          </AccordionTrigger>
          <Accordion.Content>
            <div className="p-8">
              <AmountTypeSelector
                bill={bill}
                handleSave={billsState.updateBill}
                setOpenAccordionItem={setOpenAccordionItem}
              />
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="fund" className="overflow-hidden">
          <AccordionTrigger icon={<CircleDollarSign size={24} />}>
            <div className="flex flex-col items-start">
              <div className="font-medium">Payment Source</div>
              <div className="text-sm text-blue-600 truncate w-40 flex items-start">
                {selectedFundName}
              </div>
            </div>
          </AccordionTrigger>
          <Accordion.Content>
            <div className="p-8">
              <PaymentSourceSelector
                bill={bill}
                paymentSources={paymentSourcesState.paymentSources}
                isLoadingSources={paymentSourcesState.isLoadingSources}
                isFetched={paymentSourcesState.isFetched}
                onCreatePaymentSource={handleCreatePaymentSource}
                isCreationPending={paymentSourcesState.isCreatingAndAssigning}
                onAssignPaymentSource={handleAssignPaymentSource}
                isAssigningSource={paymentSourcesState.isAssigning}
              />
            </div>
          </Accordion.Content>
        </Accordion.Item>

        <Accordion.Item value="payment-portal" className="overflow-hidden">
          <AccordionTrigger icon={<ExternalLink size={24} />}>
            <div className="flex flex-col items-start">
              <div className="font-medium">Payment Portal</div>
              <div className="text-sm text-blue-600 truncate w-40 flex items-start">
                {bill.paymentPortalUrl
                  ? bill.paymentPortalUrl
                  : "Add payment URL"}
              </div>
            </div>
          </AccordionTrigger>
          <Accordion.Content>
            <div className="p-8">
              <PaymentPortalSelector
                bill={bill}
                handleSave={billsState.updateBill}
                setOpenAccordionItem={setOpenAccordionItem}
              />
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>

      {!isCreatingNew && (
        <div className="p-6">
          <button
            onClick={handleDelete}
            className="cursor-pointer mt-6 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg w-full transition-colors font-medium"
          >
            Delete Bill
          </button>
        </div>
      )}

      {isCreatingNew && (
        <div className="p-6">
          <button
            onClick={cancelCreatingNew}
            className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg w-full transition-colors font-medium"
          >
            Cancel New Bill
          </button>
        </div>
      )}
    </div>
  );
}

const AccordionTrigger = ({ children, icon, ...props }) => (
  <Accordion.Header className="flex">
    <Accordion.Trigger
      className="group flex flex-1 items-center justify-between p-4 transition-all hover:bg-[#ebf4fa] dark:hover:bg-gray-800 relative before:block before:absolute before:left-0 before:w-1 before:h-[60%] before:content-[''] before:transition-colors before:duration-100 before:ease-out before:bg-gray-800 before:[border-radius:9px] before:opacity-0 hover:before:opacity-50 hover:before:bg-blue-600 cursor-pointer"
      {...props}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 w-12 h-12 min-w-12 min-h-12 bg-gray-100 rounded-full flex items-center justify-center">
          {icon}
        </span>
        {children}
      </div>
      <ChevronDownIcon
        size={18}
        className="text-gray-400 transition-transform duration-200 group-data-[state=open]:rotate-180"
      />
    </Accordion.Trigger>
  </Accordion.Header>
);
