import { PaymentSourceType } from "@fin/domain";

export interface UpdatePaymentSourceDTO {
  id: string;
  mutationType: "changeType" | "rename";
}

export interface RenamePaymentSourceDTO extends UpdatePaymentSourceDTO {
  name: string;
}

export interface ChangeTypePaymentSourceDTO extends UpdatePaymentSourceDTO {
  type: PaymentSourceType;
}
