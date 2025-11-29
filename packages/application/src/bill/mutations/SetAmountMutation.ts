import { Bill, BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { SetBillAmountDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

/**
 * SetAmountMutation — Concrete Strategy Implementation
 *
 * This class implements the IBillMutation interface (Strategy pattern) to
 * encapsulate the algorithm for changing the monetary payment amount due of an existing bill.
 * It coordinates with the domain service to perform the business logic and
 * returns a mapped DTO representation of the updated bill entity.
 */
export class SetAmountMutation implements IBillMutation {
  /**
   * Executes the mutation on a bill
   *
   * @param dto - The assignment data containing bill ID and payment source ID
   * @param domainService - The domain service that handles bill business logic
   * @returns Promise resolving to the updated bill as a DTO
   * @throws May throw domain errors if the bill or payment source is invalid
   */
  async execute(
    dto: SetBillAmountDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated: Bill = await domainService.setAmount(dto.id, dto.amount);
    return BillDTOMapper.toDTO(updated);
  }
}
