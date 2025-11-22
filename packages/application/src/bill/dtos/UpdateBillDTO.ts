export interface UpdateBillDTO {
  id: string;
  mutationType:
    | "rename"
    | "setDueDate"
    | "assignPaymentSource"
    | "setAmount"
    | "clearDueDate"
    | "setPaymentPortal";
}

export interface RenameBillDTO extends UpdateBillDTO {
  mutationType: "rename";
  name: string;
}

export interface SetBillAmountDTO extends UpdateBillDTO {
  mutationType: "setAmount";
  amount: number;
}

export interface SetBillDueDateDTO extends UpdateBillDTO {
  mutationType: "setDueDate";
  selectedMonth: number;
  selectedDay: number;
  isReoccurring?: boolean;
}

export interface AssignPaymentSourceDTO extends UpdateBillDTO {
  mutationType: "assignPaymentSource";
  paymentSourceId?: string;
}

export interface ClearBillDueDateDTO extends UpdateBillDTO {
  mutationType: "clearDueDate";
}

export interface SetPaymentPortalDTO extends UpdateBillDTO {
  mutationType: "setPaymentPortal";
  paymentPortalUrl: string;
}
