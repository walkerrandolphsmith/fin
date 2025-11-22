import { BillDueInNWeeksSpecificationBase } from "./BillDueInNWeeksSpecificationBase";

export class BillDueThisWeekSpecification extends BillDueInNWeeksSpecificationBase {
  protected weekOffset = 0;
}
