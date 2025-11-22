export class PaymentSourceTypeUnknown extends Error {
  constructor(value: string) {
    super(`${value} is not a known payment source type`);
    this.name = "PaymentSourceTypeUnknown";
  }
}
