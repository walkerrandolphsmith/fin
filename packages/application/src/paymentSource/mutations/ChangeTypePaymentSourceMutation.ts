import { PaymentSourceService } from "@fin/domain";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";
import { ChangeTypePaymentSourceDTO } from "../dtos/UpdatePaymentSourceDTO";
import { PaymentSourceDTOMapper } from "../mappers/PaymentSourceMapper";
import { IPaymentSourceMutation } from "./IPaymentSourceMutation";

/**
 * ChangeTypePaymentSourceMutation — Concrete Strategy Implementation
 *
 * This class implements the IPaymentSourceMutation interface (Strategy pattern) to
 * encapsulate the algorithm for changing the type of an existing payment source.
 * It coordinates with the domain service to perform the business logic and
 * returns a mapped DTO representation of the updated payment source entity.
 */
export class ChangeTypePaymentSourceMutation
  implements IPaymentSourceMutation
{
  /**
   * Executes the mutation on a payment source
   *
   * @param dto - The assignment data containing payment ID
   * @param domainService - The domain service that handles payment source business logic
   * @returns Promise resolving to the updated payment source as a DTO
   * @throws May throw domain errors
   */
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
