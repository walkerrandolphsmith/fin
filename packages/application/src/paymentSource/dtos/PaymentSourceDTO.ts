import { PaymentSourceType } from "@fin/domain";

export interface PaymentSourceDTO {
  id: string;
  name: string;
  type: PaymentSourceType;
  details?: string;
}
