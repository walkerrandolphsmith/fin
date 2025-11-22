import { Bill, BillName, BillProps, Money, PaymentPortal } from "@fin/domain";
import { BillDetails } from "../../../../bill-parser/src";
import { BillDTO } from "../dtos/BillDTO";
import { CreateBillDTO } from "../dtos/CreateBillDTO";
import { ReorderBillDTO } from "../dtos/ReorderBillsRequestDTO";

export class BillDTOMapper {
  static toDTO(bill: Bill): BillDTO {
    return {
      id: bill.id!,
      name: bill.name.name,
      amount: bill.amount.amount,
      dueDate: bill.dueDate?.toISOString().split("T")[0] ?? undefined,
      order: bill.order || Infinity,
      paymentSourceId: bill.paymentSourceId?.id,
      isReoccurring: bill.isReoccurring,
      paymentPortalUrl: bill.paymentPortal?.value,
    };
  }

  static fromCreateDTO(dto: CreateBillDTO): Bill {
    const billProperties: Omit<BillProps, "id" | "order" | "createdAt"> = {
      name: new BillName(dto.name),
      amount: new Money(dto.amount ?? 0),
      isReoccurring: true,
    };
    if (dto.paymentPortalUrl) {
      billProperties.paymentPortal = PaymentPortal.fromUrl(
        dto.paymentPortalUrl
      );
    }
    if (dto.dueDate) {
      billProperties.dueDate = new Date(dto.dueDate);
    }
    return Bill.createNew(billProperties);
  }

  static fromReorderBillDTO(dto: ReorderBillDTO): Bill {
    const ephemeralBill = Bill.createNew({
      name: new BillName("ephemeral"),
      amount: new Money(0),
      isReoccurring: true,
    });
    return Bill.rehydrate({
      name: ephemeralBill.name,
      createdAt: ephemeralBill.createdAt,
      amount: ephemeralBill.amount,
      id: dto.id,
      order: dto.order,
      isReoccurring: true,
    });
  }

  static fromBillDetails(details: BillDetails): BillDTO {
    return {
      id: "parsed-bill",
      name: details.serviceProvider ?? "",
      amount: details.amount,
      dueDate: details.dueDate,
      paymentPortalUrl: details.paymentPortal,
      isReoccurring: true,
      order: Infinity,
    };
  }
}
