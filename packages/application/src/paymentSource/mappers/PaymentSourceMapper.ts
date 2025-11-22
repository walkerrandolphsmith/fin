import {
  PaymentSource,
  PaymentSourceName,
  PaymentSourceType,
  PaymentSourceTypeObject,
} from "@fin/domain";
import { CreatePaymentSourceDTO } from "../dtos/CreatePaymentSourceDTO";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";

export class PaymentSourceDTOMapper {
  static toDTO(paymentSource: PaymentSource): PaymentSourceDTO {
    return {
      id: paymentSource.id!,
      name: paymentSource.name.name,
      type: paymentSource.type.type,
      details: paymentSource.details,
    };
  }

  static fromCreateDTO(dto: CreatePaymentSourceDTO): PaymentSource {
    return PaymentSource.createNew({
      name: new PaymentSourceName(dto.name),
      type: new PaymentSourceTypeObject(dto.type as PaymentSourceType),
      details: dto.details,
    });
  }
}
