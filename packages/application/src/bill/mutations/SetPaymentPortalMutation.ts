import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { SetPaymentPortalDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

/**
 * SetPaymentPortalMutation — Concrete Strategy Implementation
 *
 * This class implements the IBillMutation interface (Strategy pattern) to
 * encapsulate the algorithm for changing the payment portal of an existing bill.
 * It coordinates with the domain service to perform the business logic and
 * returns a mapped DTO representation of the updated bill entity.
 */
export class SetPaymentPortalMutation implements IBillMutation {
  /**
   * Executes the mutation on a bill
   *
   * @param dto - The assignment data containing bill ID and payment source ID
   * @param domainService - The domain service that handles bill business logic
   * @returns Promise resolving to the updated bill as a DTO
   * @throws May throw domain errors if the bill or payment source is invalid
   */
  async execute(
    dto: SetPaymentPortalDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated = await domainService.setPaymentPortalUrl(
      dto.id,
      dto.paymentPortalUrl
    );
    return BillDTOMapper.toDTO(updated);
  }
}
