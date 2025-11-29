import { Bill, BillName, BillProps, Money, PaymentPortal } from "@fin/domain";
import { BillDetails } from "../../../../bill-parser/src";
import { BillDTO } from "../dtos/BillDTO";
import { CreateBillDTO } from "../dtos/CreateBillDTO";
import { ReorderBillDTO } from "../dtos/ReorderBillsRequestDTO";

/**
 * Mapper responsible for converting between domain `Bill` entities and the
 * transport DTOs used by the application layer (e.g., API responses or
 * request payloads).
 *
 * Each method is a pure transformation and does not perform I/O.
 */
export class BillDTOMapper {
  /**
   * Convert a domain Bill into a BillDTO suitable for API responses.
   *
   * @param {Bill} bill - Domain bill instance to convert.
   * @returns {BillDTO} Plain DTO representing the bill.
   */
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

  /**
   * Create a new domain Bill from a CreateBillDTO (request payload).
   *
   * The method constructs the required value objects and populates optional
   * fields (payment portal and due date) when provided.
   *
   * @param {CreateBillDTO} dto - Incoming create request DTO.
   * @returns {Bill} Newly created domain Bill.
   */
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

  /**
   * Convert a Reorder DTO into a lightweight Bill instance used for
   * performing reorder operations. The returned entity is a rehydrated
   * ephemeral Bill with the provided id and order.
   *
   * @param {ReorderBillDTO} dto - DTO containing id and order.
   * @returns {Bill} Rehydrated bill used for reorder operations.
   */
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

  /**
   * Map parsed BillDetails (from parsers) into a BillDTO for downstream
   * consumers (e.g., CLI or API preview). The DTO uses a placeholder id and
   * preserves parsed fields. Confidence is not part of the DTO but can be
   * inspected by callers of the parser.
   *
   * @param {BillDetails} details - Parsed fields returned by a bill parser.
   * @returns {BillDTO} DTO representing the parsed bill data.
   */
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
