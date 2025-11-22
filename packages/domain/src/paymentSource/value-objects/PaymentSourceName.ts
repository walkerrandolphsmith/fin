import { EntityMustHaveNameError } from "../../common/errors/EntityMustHaveNameError";

export class PaymentSourceName {
  constructor(public readonly name: string) {
    this.name = name.trim();
    if (this.name.length <= 0) {
      throw new EntityMustHaveNameError();
    }
  }
}
