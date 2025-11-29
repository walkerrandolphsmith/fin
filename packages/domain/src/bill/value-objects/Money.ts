import { BillAmountCannotExceedThreshold } from "../errors/BillAmountCannotExceedThreshold";
import { BillAmountMustBePositive } from "../errors/BillAmountMustBePositive";

/**
 * Value object representing a monetary amount for a Bill.
 *
 * The Money value object is responsible for validating domain constraints on
 * amounts: it must be positive and not exceed the configured business
 * threshold. Validation failures throw domain-specific errors.
 */
export class Money {
  /**
   * Construct a Money value object.
   *
   * @param {number} amount - Numeric amount for the bill.
   * @throws {BillAmountMustBePositive} If amount is negative.
   * @throws {BillAmountCannotExceedThreshold} If amount is greater than 3000.
   * @example
   * const m = new Money(12.34);
   */
  constructor(public readonly amount: number) {
    if (amount < 0) throw new BillAmountMustBePositive();
    if (amount > 3000) throw new BillAmountCannotExceedThreshold();
  }
}
