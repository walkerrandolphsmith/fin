import { BillAmountCannotExceedThreshold } from "../errors/BillAmountCannotExceedThreshold";
import { BillAmountMustBePositive } from "../errors/BillAmountMustBePositive";

export class Money {
  constructor(public readonly amount: number) {
    if (amount < 0) throw new BillAmountMustBePositive();
    if (amount > 3000) throw new BillAmountCannotExceedThreshold();
  }
}
