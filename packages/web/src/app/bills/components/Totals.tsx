import { BillFilter } from "@fin/application";
import { useBills } from "../hooks/useBills";

type TotalsProps = {
  filter?: BillFilter;
};

function Totals({ filter }: TotalsProps) {
  const billsState = useBills(filter);
  const totalAmount = billsState.bills.reduce(
    (sum, bill) => sum + bill.amount,
    0
  );

  return (
    <div className="mb-6 flex flex-col items-end mr-4">
      <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        ${totalAmount.toFixed(2)}
      </p>
    </div>
  );
}

export default Totals;
