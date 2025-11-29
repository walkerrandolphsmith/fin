import { Bill, BillService as DomainService } from "@fin/domain";
import {
  BillDetails,
  IExtractBillDetailsFromPrintableDocuments,
} from "../../../../bill-parser/src";
import { BillDTO } from "../dtos/BillDTO";
import { ReorderBillsRequestDTO } from "../dtos/ReorderBillsRequestDTO";
import { UpdateBillDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { AssignPaymentSourceMutation } from "../mutations/AssignPaymentSourceMutation";
import { ClearDueDateMutation } from "../mutations/ClearDueDateMutation";
import { IBillMutation } from "../mutations/IBillMutation";
import { RenameBillMutation } from "../mutations/RenameBillMutation";
import { SetAmountMutation } from "../mutations/SetAmountMutation";
import { SetDueDateMutation } from "../mutations/SetDueDateMutation";
import { SetPaymentPortalMutation } from "../mutations/SetPaymentPortalMutation";
import { BillFilter } from "../types";

/**
 * Application Service for Bill Operations
 *
 * This service coordinates between the presentation layer (DTOs) and domain layer,
 * implementing the Strategy pattern for bill mutations. It selects appropriate mutation strategies
 * at runtime based on the mutation type,
 * enabling flexible and extensible bill update operations without tight coupling
 * to specific mutation implementations.
 */
export class BillService {
  /**
   * Creates a new BillService instance
   *
   * @param domainService - The domain service that contains core business logic
   * @param billParser - Parser strategy for extracting bill details from documents
   */
  constructor(
    private readonly domainService: DomainService,
    private readonly billParser: IExtractBillDetailsFromPrintableDocuments
  ) {}

  /**
   * Strategy Pattern — Mutation Strategy Selection
   *
   * This method implements the Strategy pattern by selecting and instantiating
   * the appropriate IBillMutation concrete strategy based on the mutation type.
   * Each mutation type maps to a specific algorithm encapsulated in its own
   * strategy class, enabling runtime strategy selection and easy extensibility.
   *
   * @param dto - The update DTO containing the mutation type and data
   * @returns The concrete mutation strategy instance to execute
   */
  private chooseStrategy(dto: UpdateBillDTO): IBillMutation {
    switch (dto.mutationType) {
      case "rename":
        return new RenameBillMutation();
      case "setDueDate":
        return new SetDueDateMutation();
      case "setAmount":
        return new SetAmountMutation();
      case "assignPaymentSource":
        return new AssignPaymentSourceMutation();
      case "clearDueDate":
        return new ClearDueDateMutation();
      case "setPaymentPortal":
        return new SetPaymentPortalMutation();
    }
  }

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
  async updateBill(dto: UpdateBillDTO): Promise<BillDTO> {
    const updateStrategy = this.chooseStrategy(dto);
    return updateStrategy.execute(dto, this.domainService);
  }

  /**
   * Reorders multiple bills based on the provided request
   *
   * @param reorderRequestDto - DTO containing the bills with their new order
   * @returns Promise resolving to the reordered bills as DTOs
   * @throws May throw domain errors if reordering fails
   */
  async reorderBills(
    reorderRequestDto: ReorderBillsRequestDTO
  ): Promise<BillDTO[]> {
    const bills: Bill[] = reorderRequestDto.updates.map(
      BillDTOMapper.fromReorderBillDTO
    );
    const reorderedBills = await this.domainService.reorderBills(bills);
    return reorderedBills.map(BillDTOMapper.toDTO);
  }

  /**
   * Retrieves bills with optional filtering
   *
   * @param filter - Optional filter to apply (dueThisWeek, dueNextWeek, or all)
   * @returns Promise resolving to filtered bills as DTOs
   * @throws May throw domain errors if retrieval fails
   */
  async getBills(filter?: BillFilter): Promise<BillDTO[]> {
    let bills: Bill[];
    if (filter === "dueThisWeek") {
      bills = await this.domainService.getBillsDueThisWeek();
    } else if (filter === "dueNextWeek") {
      bills = await this.domainService.getBillsDueNextWeek();
    } else {
      bills = await this.domainService.getAllBills();
    }

    return bills.map(BillDTOMapper.toDTO);
  }

  /**
   * Extracts bill details from a document buffer using the configured parser strategy
   *
   * @param buffer - The document buffer to parse (typically PDF)
   * @returns Promise resolving to extracted bill details as DTO
   * @throws May throw parsing errors if document cannot be processed
   */
  async extractFromBuffer(buffer: Buffer): Promise<BillDTO> {
    const billDetails: BillDetails = await this.billParser.parse(buffer);

    const billDTO = BillDTOMapper.fromBillDetails(billDetails);

    return billDTO;
  }
}
