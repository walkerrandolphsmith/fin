import { PaymentSourceService } from "@fin/domain";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";
import { UpdatePaymentSourceDTO } from "../dtos/UpdatePaymentSourceDTO";

export interface IPaymentSourceMutation {
  execute(
    dto: UpdatePaymentSourceDTO,
    domainService: PaymentSourceService
  ): Promise<PaymentSourceDTO>;
}
