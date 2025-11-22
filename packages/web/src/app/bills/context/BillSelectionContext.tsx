import { BillDTO } from "@fin/application";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface BillSelectionContextValue {
  selectedId: string | null;
  selectBill: (id: string | null) => void;
  selectedBill: BillDTO | null;
  isCreatingNew: boolean;
  startCreatingNew: () => void;
  cancelCreatingNew: () => void;
  newBillData: (Partial<BillDTO> & { id: string }) | null;
  updateNewBillData: (data: Partial<BillDTO>) => void;
}

const BillSelectionContext = createContext<BillSelectionContextValue | null>(
  null
);

export function BillSelectionProvider({
  children,
  bills,
}: {
  children: ReactNode;
  bills: BillDTO[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newBillData, setNewBillData] = useState<
    (Partial<BillDTO> & { id: string }) | null
  >(null);

  useEffect(() => {
    if (bills.length > 0 && !selectedId && !isCreatingNew) {
      setSelectedId(bills[0].id);
    }
  }, [bills, selectedId, isCreatingNew]);

  useEffect(() => {
    if (
      selectedId &&
      !bills.find((b) => b.id === selectedId) &&
      !isCreatingNew
    ) {
      setSelectedId(bills[0]?.id ?? null);
    }
  }, [bills, selectedId, isCreatingNew]);

  const selectedBill = bills.find((b) => b.id === selectedId) ?? null;

  const startCreatingNew = () => {
    const tempId = "new-" + Date.now();
    setNewBillData({ id: tempId, name: "", amount: 0, dueDate: "" });
    setSelectedId(tempId);
    setIsCreatingNew(true);
  };

  const cancelCreatingNew = () => {
    setIsCreatingNew(false);
    setNewBillData(null);
    setSelectedId(bills[0]?.id ?? null);
  };

  const updateNewBillData = (data: Partial<BillDTO>) => {
    setNewBillData((prev) => ({ ...prev!, ...data }));
  };

  return (
    <BillSelectionContext.Provider
      value={{
        selectedId,
        selectBill: setSelectedId,
        selectedBill,
        isCreatingNew,
        startCreatingNew,
        cancelCreatingNew,
        newBillData,
        updateNewBillData,
      }}
    >
      {children}
    </BillSelectionContext.Provider>
  );
}

export function useBillSelection() {
  const context = useContext(BillSelectionContext);
  if (!context) {
    throw new Error(
      "useBillSelection must be used within BillSelectionProvider"
    );
  }
  return context;
}
