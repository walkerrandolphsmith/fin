import {
  PaymentSource,
  PaymentSourceName,
  PaymentSourceType,
  PaymentSourceTypeObject,
} from "@fin/domain";
import { IPaymentSource } from "./PaymentSourceModel";

/**
 * Mapper to convert between the persistence model `IPaymentSource` and the
 * domain `PaymentSource` entity.
 *
 * The mapper centralizes knowledge of how value objects are serialized and
 * rehydrated so that repository implementations remain simple.
 */
export class PaymentSourceMapper {
  /**
   * Rehydrate a domain PaymentSource from the persistence document.
   *
   * @param {IPaymentSource} doc - Persistence document from Mongoose.
   * @returns {PaymentSource} Rehydrated domain entity.
   */
  static fromModel(doc: IPaymentSource): PaymentSource {
    return PaymentSource.rehydrate({
      id: doc._id.toString(),
      name: new PaymentSourceName(doc.name),
      type: new PaymentSourceTypeObject(doc.type as PaymentSourceType),
      createdAt: doc.createdAt,
    });
  }

  /**
   * Convert a domain PaymentSource into a partial persistence model.
   *
   * @param {PaymentSource} paymentSource - The domain entity to convert.
   * @returns {Partial<IPaymentSource>} Plain object suitable for Mongoose.
   */
  static toModel(paymentSource: PaymentSource): Partial<IPaymentSource> {
    return {
      name: paymentSource.name.name,
      type: paymentSource.type.type,
      createdAt: paymentSource.createdAt,
      details: paymentSource.details,
    };
  }
}
