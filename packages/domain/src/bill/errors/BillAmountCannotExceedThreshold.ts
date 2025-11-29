/**
 * Error thrown when an attempted bill amount exceeds the permitted threshold.
 *
 * This error communicates domain validation failures related to bill amounts
 * and is intended to be thrown by domain logic (value objects, factories,
 * or services) when the amount is above the allowed maximum (3000 dollars).
 *
 * @extends Error
 * @example
 * throw new BillAmountCannotExceedThreshold();
 */
export class BillAmountCannotExceedThreshold extends Error {
  constructor() {
    super(`Bills can not exceed 3000 dollars`);
    this.name = "BillAmountCannotExceedThreshold";
    // Restore proper prototype chain for instanceof checks to work in ES5 targets
    Object.setPrototypeOf(this, BillAmountCannotExceedThreshold.prototype);
  }
}
