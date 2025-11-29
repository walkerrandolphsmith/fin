import { BillDueInNWeeksSpecificationBase } from "./BillDueInNWeeksSpecificationBase";

/**
 * Specification that matches bills due this week.
 *
 * Concrete implementation of `BillDueInNWeeksSpecificationBase` that sets the
 * `weekOffset` hook to `0` meaning the base algorithm will test whether a
 * bill's due date falls within the current week.
 */
export class BillDueThisWeekSpecification extends BillDueInNWeeksSpecificationBase {
  protected weekOffset = 0;
}
