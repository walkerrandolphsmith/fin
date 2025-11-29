import { BillService } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { UpdateBillDTO } from "../dtos/UpdateBillDTO";

/**
 * Strategy pattern — IBillMutation
 *
 * This interface defines a family of algorithms for performing updates to a
 * Bill. Each concrete implementation encapsulates a specific mutation
 * behavior (for example: apply a patch, reorder bills, mark a bill as paid,
 * or perform a complex domain update). Callers select and execute a concrete
 * IBillMutation instance at runtime without depending on the concrete type,
 * enabling loose coupling, easier testing, and open/closed extensibility.
 */
export interface IBillMutation {
  execute(dto: UpdateBillDTO, domainService: BillService): Promise<BillDTO>;
}
