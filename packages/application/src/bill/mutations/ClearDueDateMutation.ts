import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { ClearBillDueDateDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

export class ClearDueDateMutation implements IBillMutation {
  async execute(
    dto: ClearBillDueDateDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated = await domainService.clearDueDate(dto.id);
    return BillDTOMapper.toDTO(updated);
  }
}
