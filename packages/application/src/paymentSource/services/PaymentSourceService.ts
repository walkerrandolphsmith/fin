import { PaymentSourceService as DomainService } from "@fin/domain";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";
import { UpdatePaymentSourceDTO } from "../dtos/UpdatePaymentSourceDTO";
import { ChangeTypePaymentSourceMutation } from "../mutations/ChangeTypePaymentSourceMutation";
import { IPaymentSourceMutation } from "../mutations/IPaymentSourceMutation";
import { RenamePaymentSourceMutation } from "../mutations/RenamePaymentSourceMutation";

export class PaymentSourceService {
  constructor(private readonly domainService: DomainService) {}

  async updatePaymentSource(
    dto: UpdatePaymentSourceDTO
  ): Promise<PaymentSourceDTO> {
    const updateStrategy = this.chooseStrategy(dto);
    return updateStrategy.execute(dto, this.domainService);
  }

  private chooseStrategy(dto: UpdatePaymentSourceDTO): IPaymentSourceMutation {
    switch (dto.mutationType) {
      case "rename":
        return new RenamePaymentSourceMutation();
      case "changeType":
        return new ChangeTypePaymentSourceMutation();
    }
  }
}
