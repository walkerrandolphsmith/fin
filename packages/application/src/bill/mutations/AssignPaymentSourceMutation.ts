import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { AssignPaymentSourceDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

export class AssignPaymentSourceMutation implements IBillMutation {
  async execute(
    dto: AssignPaymentSourceDTO,
    domainService: BillService
  ): Promise<BillDTO> {
    const updated = await domainService.assignPaymentSource(
      dto.id,
      dto.paymentSourceId
    );
    return BillDTOMapper.toDTO(updated);
  }
}
