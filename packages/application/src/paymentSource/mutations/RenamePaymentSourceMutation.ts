import { PaymentSourceService } from "@fin/domain";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";
import { RenamePaymentSourceDTO } from "../dtos/UpdatePaymentSourceDTO";
import { PaymentSourceDTOMapper } from "../mappers/PaymentSourceMapper";
import { IPaymentSourceMutation } from "./IPaymentSourceMutation";

export class RenamePaymentSourceMutation implements IPaymentSourceMutation {
  async execute(
    dto: RenamePaymentSourceDTO,
    domainService: PaymentSourceService
  ): Promise<PaymentSourceDTO> {
    const updated = await domainService.renamePaymentSource(dto.id, dto.name);
    return PaymentSourceDTOMapper.toDTO(updated);
  }
}
