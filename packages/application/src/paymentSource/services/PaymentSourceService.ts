import { PaymentSourceService as DomainService } from "@fin/domain";
import { PaymentSourceDTO } from "../dtos/PaymentSourceDTO";
import { UpdatePaymentSourceDTO } from "../dtos/UpdatePaymentSourceDTO";
import { ChangeTypePaymentSourceMutation } from "../mutations/ChangeTypePaymentSourceMutation";
import { IPaymentSourceMutation } from "../mutations/IPaymentSourceMutation";
import { RenamePaymentSourceMutation } from "../mutations/RenamePaymentSourceMutation";

export class PaymentSourceService {
  constructor(private readonly domainService: DomainService) {}

  /**
   * Strategy Pattern — Context Method
   *
   * This method acts as the Strategy pattern context, orchestrating the
   * strategy selection and execution. It demonstrates the pattern's key benefit:
   * the client (this method) remains unchanged regardless of which concrete
   * strategy is selected and executed.
   *
   * @param dto - The update request containing mutation type and data
   * @returns Promise resolving to the updated bill DTO
   * @throws May throw domain errors from the selected strategy execution
   */
  async updatePaymentSource(
    dto: UpdatePaymentSourceDTO
  ): Promise<PaymentSourceDTO> {
    const updateStrategy = this.chooseStrategy(dto);
    return updateStrategy.execute(dto, this.domainService);
  }

  /**
   * Strategy Pattern — Mutation Strategy Selection
   *
   * This method implements the Strategy pattern by selecting and instantiating
   * the appropriate IPaymentSourceMutation concrete strategy based on the mutation type.
   * Each mutation type maps to a specific algorithm encapsulated in its own
   * strategy class, enabling runtime strategy selection and easy extensibility.
   *
   * @param dto - The update DTO containing the mutation type and data
   * @returns The concrete mutation strategy instance to execute
   */
  private chooseStrategy(dto: UpdatePaymentSourceDTO): IPaymentSourceMutation {
    switch (dto.mutationType) {
      case "rename":
        return new RenamePaymentSourceMutation();
      case "changeType":
        return new ChangeTypePaymentSourceMutation();
    }
  }
}
