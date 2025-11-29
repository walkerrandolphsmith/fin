/**
 * Error thrown when an unknown payment source type string is encountered.
 *
 * @extends Error
 * @param {string} value - The unknown type value included in the message.
 * @example
 * throw new PaymentSourceTypeUnknown('foobar');
 */
export class PaymentSourceTypeUnknown extends Error {
  constructor(value: string) {
    super(`${value} is not a known payment source type`);
    this.name = "PaymentSourceTypeUnknown";
    Object.setPrototypeOf(this, PaymentSourceTypeUnknown.prototype);
  }
}
