import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { RenameBillDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

export class RenameBillMutation implements IBillMutation {
  async execute(
    dto: RenameBillDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated = await domainService.renameBill(dto.id, dto.name);
    return BillDTOMapper.toDTO(updated);
  }
}
