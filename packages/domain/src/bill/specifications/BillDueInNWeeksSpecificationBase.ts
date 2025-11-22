import { ISpecification } from "../../common/ISpecification";
import { Bill } from "../entities/Bill";

export abstract class BillDueInNWeeksSpecificationBase
  implements ISpecification<Bill>
{
  protected abstract weekOffset: number;

  isSatisfiedBy(bill: Bill): boolean {
    if (!bill.dueDate) return false;

    const { start, end } = this.getWeekRange(this.weekOffset);
    return bill.dueDate >= start && bill.dueDate <= end;
  }

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
