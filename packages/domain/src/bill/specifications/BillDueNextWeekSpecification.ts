import { BillDueInNWeeksSpecificationBase } from "./BillDueInNWeeksSpecificationBase";

/**
 * Specification that matches bills due next week.
 *
 * This is a concrete implementation of the template provided by
 * `BillDueInNWeeksSpecificationBase`. It sets the `weekOffset` hook to `1`,
 * meaning the base class algorithm will compute the date range for the week
 * immediately following the current week and test bills against that range.
 *
 * @example
 * const spec = new BillDueNextWeekSpecification();
 * const matches = spec.isSatisfiedBy(bill);
 */
export class BillDueNextWeekSpecification extends BillDueInNWeeksSpecificationBase {
  protected weekOffset = 1;
}
