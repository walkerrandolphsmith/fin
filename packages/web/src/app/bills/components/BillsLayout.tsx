"use client";

import ListSkeleton from "@/components/ListSkeleton";
import { BillFilter } from "@fin/application";
import { useState } from "react";
import { BillSelectionProvider } from "../context/BillSelectionContext";
import { useBills } from "../hooks/useBills";
import BillDetails from "./BillDetails";
import BillsList from "./BillsList";
import Filters from "./Filters";
import ImportBillModal from "./ImportBillModal";

export default function BillsLayout() {
  const [filter, setFilter] = useState<BillFilter>(undefined);
  const billsState = useBills(filter);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <BillSelectionProvider bills={billsState.bills}>
      <ImportBillModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
      <section className="hero relative mb-0 lg:mb-40 mt-12 lg:mt-20 max-w-screen-xl mx-auto px-4">
        <Filters filter={filter} setFilter={setFilter} />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-gray-900">
            {billsState.isLoading ? (
              <ListSkeleton />
            ) : billsState.isError ? (
              <div className="py-8 text-center text-red-500">
                Error loading bills.
              </div>
            ) : (
              <BillsList
                bills={billsState.bills}
                billsState={billsState}
                setModalOpen={setModalOpen}
              />
            )}
          </div>
          <div className="lg:col-span-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <BillDetails billsState={billsState} />
          </div>
        </div>
      </section>
    </BillSelectionProvider>
  );
}
