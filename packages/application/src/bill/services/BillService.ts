import { Bill, BillService as DomainService } from "@fin/domain";
import { BillDetails, IParseBillDocument } from "../../../../bill-parser/src";
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

export class BillService {
  constructor(
    private readonly domainService: DomainService,
    private readonly billParser: IParseBillDocument
  ) {}

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

  async updateBill(dto: UpdateBillDTO): Promise<BillDTO> {
    const updateStrategy = this.chooseStrategy(dto);
    return updateStrategy.execute(dto, this.domainService);
  }

  async reorderBills(
    reorderRequestDto: ReorderBillsRequestDTO
  ): Promise<BillDTO[]> {
    const bills: Bill[] = reorderRequestDto.updates.map(
      BillDTOMapper.fromReorderBillDTO
    );
    const reorderedBills = await this.domainService.reorderBills(bills);
    return reorderedBills.map(BillDTOMapper.toDTO);
  }

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

  async extractFromBuffer(buffer: Buffer): Promise<BillDTO> {
    const billDetails: BillDetails = await this.billParser.parse(buffer);

    const billDTO = BillDTOMapper.fromBillDetails(billDetails);

    return billDTO;
  }
}
