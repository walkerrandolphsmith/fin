/**
 * Error thrown when an attempted bill amount is not a positive number.
 *
 * Thrown by domain validation logic when a bill's amount is zero or negative.
 *
 * @extends Error
 * @example
 * throw new BillAmountMustBePositive();
 */
export class BillAmountMustBePositive extends Error {
  constructor() {
    super(`Bills must be positive numbers`);
    this.name = "BillAmountMustBePositive";
    // Ensure instanceof works correctly for transpiled targets
    Object.setPrototypeOf(this, BillAmountMustBePositive.prototype);
  }
}
