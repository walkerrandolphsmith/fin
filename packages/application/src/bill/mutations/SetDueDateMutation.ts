import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { SetBillDueDateDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

export class SetDueDateMutation implements IBillMutation {
  async execute(
    dto: SetBillDueDateDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated = await domainService.setDueDate(
      dto.id,
      dto.selectedDay,
      dto.selectedMonth,
      dto.isReoccurring
    );
    return BillDTOMapper.toDTO(updated);
  }
}
