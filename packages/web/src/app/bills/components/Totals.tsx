import { BillFilter } from "@fin/application";
import { useBills } from "../hooks/useBills";

type TotalsProps = {
  filter?: BillFilter;
};

function Totals({ filter }: TotalsProps) {
  const billsState = useBills(filter);

  const fixedTotal = billsState.bills
    .filter((bill) => bill.hasFixedAmount)
    .reduce((sum, bill) => sum + bill.amount, 0);

  const variableTotal = billsState.bills
    .filter((bill) => !bill.hasFixedAmount)
    .reduce((sum, bill) => sum + bill.amount, 0);

  const totalAmount = fixedTotal + variableTotal;

  return (
    <div className="mb-6 flex gap-8 items-start justify-end mr-4">
      <TotalCard label="Fixed" amount={fixedTotal} />
      <TotalCard label="Variable" amount={variableTotal} />
      <div className="px-8" />
      <TotalCard label="Total" amount={totalAmount} emphasized />
    </div>
  );
}

const TotalCard = ({
  label,
  amount,
  emphasized = false,
}: {
  label: string;
  amount: number;
  emphasized?: boolean;
}) => (
  <div className="flex flex-col items-end">
    <p
      className={`text-sm ${emphasized ? "font-semibold" : ""} text-gray-600 dark:text-gray-400`}
    >
      {label}
    </p>
    <p
      className={`${emphasized ? "text-3xl" : "text-2xl"} font-bold text-gray-900 dark:text-white`}
    >
      ${amount.toFixed(2)}
    </p>
  </div>
);

export default Totals;
