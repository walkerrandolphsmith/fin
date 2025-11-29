import {
  PaymentSource,
  PaymentSourceName,
  PaymentSourceType,
  PaymentSourceTypeObject,
} from "@fin/domain";
import { CreatePaymentSourceDTO } from "../dtos/CreatePaymentSourceDTO";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";

export class PaymentSourceDTOMapper {
  /**
   * Convert a domain PaymentSource into a PaymentSourceDTO suitable for API responses.
   *
   * @param {PaymentSource} paymentSource - Domain payment source instance to convert.
   * @returns {PaymentSourceDTO} Plain DTO representing the payment source.
   */
  static toDTO(paymentSource: PaymentSource): PaymentSourceDTO {
    return {
      id: paymentSource.id!,
      name: paymentSource.name.name,
      type: paymentSource.type.type,
      details: paymentSource.details,
    };
  }

  /**
   * Create a new domain PaymentSource from a CreatePaymentSourceDTO (request payload).
   *
   * The method constructs the required value objects
   *
   * @param {CreatePaymentSourceDTO} dto - Incoming create request DTO.
   * @returns {PaymentSource} Newly created domain PaymentSource.
   */
  static fromCreateDTO(dto: CreatePaymentSourceDTO): PaymentSource {
    return PaymentSource.createNew({
      name: new PaymentSourceName(dto.name),
      type: new PaymentSourceTypeObject(dto.type as PaymentSourceType),
      details: dto.details,
    });
  }
}
