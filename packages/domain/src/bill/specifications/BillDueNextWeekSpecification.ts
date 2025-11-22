import { BillDueInNWeeksSpecificationBase } from "./BillDueInNWeeksSpecificationBase";

export class BillDueNextWeekSpecification extends BillDueInNWeeksSpecificationBase {
  protected weekOffset = 1;
}
