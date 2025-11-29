import { PaymentSourceTypeUnknown } from "../errors/PaymentSourceTypeUnknown";

/**
 * Enumeration of supported payment source types.
 * @enum {string}
 */
export enum PaymentSourceType {
  BANK_ACCOUNT = "BANK_ACCOUNT",
  DEBIT_CARD = "DEBIT_CARD",
  CREDIT_CARD = "CREDIT_CARD",
  VENMO = "VENMO",
  PAYPAL = "PAYPAL",
  CASH = "CASH",
  OTHER = "OTHER",
}

/**
 * Value object wrapping a PaymentSourceType enum value and validating inputs.
 *
 * The constructor accepts either a `PaymentSourceType` value or a raw string
 * and throws `PaymentSourceTypeUnknown` when the provided value is not a
 * recognized enum member.
 */
export class PaymentSourceTypeObject {
  public readonly type: PaymentSourceType;

  /**
   * Construct a PaymentSourceTypeObject.
   *
   * @param {PaymentSourceType | string} type - The type value to wrap and validate.
   * @throws {PaymentSourceTypeUnknown} When the provided value is not a known type.
   */
  constructor(type: PaymentSourceType | string) {
    if (
      !Object.values(PaymentSourceType).includes(type as PaymentSourceType)
    ) {
      throw new PaymentSourceTypeUnknown(type);
    }

    this.type = type as PaymentSourceType;
  }
}
