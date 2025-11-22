export class BillAmountCannotExceedThreshold extends Error {
  constructor() {
    super(`Bills can not exceed 3000 dollars`);
    this.name = "BillAmountCannotExceedThreshold";
  }
}
