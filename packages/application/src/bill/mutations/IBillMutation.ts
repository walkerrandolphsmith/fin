import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { UpdateBillDTO } from "../dtos/UpdateBillDTO";

export interface IBillMutation {
  execute(dto: UpdateBillDTO, domainService: BillService): Promise<BillDTO>;
}
