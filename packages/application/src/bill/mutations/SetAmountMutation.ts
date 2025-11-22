import { Bill, BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { SetBillAmountDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

export class SetAmountMutation implements IBillMutation {
  async execute(
    dto: SetBillAmountDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated: Bill = await domainService.setAmount(dto.id, dto.amount);
    return BillDTOMapper.toDTO(updated);
  }
}
