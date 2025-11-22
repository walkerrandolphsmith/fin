import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { SetPaymentPortalDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { IBillMutation } from "./IBillMutation";

export class SetPaymentPortalMutation implements IBillMutation {
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
