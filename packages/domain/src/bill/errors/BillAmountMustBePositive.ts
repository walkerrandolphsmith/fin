export class BillAmountMustBePositive extends Error {
  constructor() {
    super(`Bills must be positive numbers`);
    this.name = "BillAmountMustBePositive";
  }
}
