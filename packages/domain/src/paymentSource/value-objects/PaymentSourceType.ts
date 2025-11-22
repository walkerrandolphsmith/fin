import { PaymentSourceTypeUnknown } from "../errors/PaymentSourceTypeUnknown";

export enum PaymentSourceType {
  BANK_ACCOUNT = "BANK_ACCOUNT",
  DEBIT_CARD = "DEBIT_CARD",
  CREDIT_CARD = "CREDIT_CARD",
  VENMO = "VENMO",
  PAYPAL = "PAYPAL",
  CASH = "CASH",
  OTHER = "OTHER",
}

export class PaymentSourceTypeObject {
  public readonly type: PaymentSourceType;

  constructor(type: PaymentSourceType | string) {
    if (
      !Object.values(PaymentSourceType).includes(type as PaymentSourceType)
    ) {
      throw new PaymentSourceTypeUnknown(type);
    }

    this.type = type as PaymentSourceType;
  }
}
