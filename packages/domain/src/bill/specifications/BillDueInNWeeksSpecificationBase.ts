import { ISpecification } from "../../common/ISpecification";
import { Bill } from "../entities/Bill";

/**
 * Base specification that tests whether a bill's due date falls within a
 * particular week relative to the current week.
 *
 * This class uses the Template Method design pattern: concrete subclasses
 * provide the specific `weekOffset` value (the "hook" / template parameter)
 * while this base class implements the algorithm for determining the start
 * and end of the target week and performing the date comparison.
 *
 * Example subclasses:
 * - `BillDueThisWeekSpecification` sets `weekOffset = 0`.
 * - `BillDueNextWeekSpecification` sets `weekOffset = 1`.
 *
 * @implements ISpecification<Bill>
 */
export abstract class BillDueInNWeeksSpecificationBase
  implements ISpecification<Bill>
{
  /**
   * Template parameter provided by subclasses indicating how many weeks
   * offset from the current week should be evaluated (e.g., 0 = this week,
   * 1 = next week).
   */
  protected abstract weekOffset: number;

  /**
   * Determine whether the provided bill satisfies the specification.
   *
   * The implementation delegates to the shared `getWeekRange` algorithm and
   * compares the bill's due date against the computed start/end range.
   *
   * @param {Bill} bill - Bill instance to test.
   * @returns {boolean} True when the bill's due date falls within the week.
   */
  isSatisfiedBy(bill: Bill): boolean {
    if (!bill.dueDate) return false;

    const { start, end } = this.getWeekRange(this.weekOffset);
    return bill.dueDate >= start && bill.dueDate <= end;
  }

  /**
   * Compute the start and end Date boundaries for the week identified by the
   * given offset relative to the current week. Start is set to 00:00:00.000
   * of the first day of the week (Sunday) and end to 23:59:59.999 of the last
   * day (Saturday).
   *
   * @private
   * @param {number} [offsetWeeks=0] - Number of weeks offset from current week.
   * @returns {{ start: Date; end: Date }} Object containing start and end dates.
   */
  private getWeekRange(offsetWeeks = 0): { start: Date; end: Date } {
    const now = new Date();

    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek + offsetWeeks * 7);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start, end };
  }
}
