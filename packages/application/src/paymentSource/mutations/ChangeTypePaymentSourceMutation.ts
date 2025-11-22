import { PaymentSourceService } from "@fin/domain";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";
import { ChangeTypePaymentSourceDTO } from "../dtos/UpdatePaymentSourceDTO";
import { PaymentSourceDTOMapper } from "../mappers/PaymentSourceMapper";
import { IPaymentSourceMutation } from "./IPaymentSourceMutation";

export class ChangeTypePaymentSourceMutation
  implements IPaymentSourceMutation
{
  async execute(
    dto: ChangeTypePaymentSourceDTO,
    domainService: PaymentSourceService
  ): Promise<PaymentSourceDTO> {
    const updated = await domainService.changeTypePaymentSource(
      dto.id,
      dto.type
    );
    return PaymentSourceDTOMapper.toDTO(updated);
  }
}
