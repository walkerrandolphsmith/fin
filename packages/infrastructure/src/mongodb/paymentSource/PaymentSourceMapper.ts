import {
  PaymentSource,
  PaymentSourceName,
  PaymentSourceType,
  PaymentSourceTypeObject,
} from "@fin/domain";
import { IPaymentSource } from "./PaymentSourceModel";

export class PaymentSourceMapper {
  static fromModel(doc: IPaymentSource): PaymentSource {
    return PaymentSource.rehydrate({
      id: doc._id.toString(),
      name: new PaymentSourceName(doc.name),
      type: new PaymentSourceTypeObject(doc.type as PaymentSourceType),
      createdAt: doc.createdAt,
    });
  }

  static toModel(paymentSource: PaymentSource): Partial<IPaymentSource> {
    return {
      name: paymentSource.name.name,
      type: paymentSource.type.type,
      createdAt: paymentSource.createdAt,
      details: paymentSource.details,
    };
  }
}
