import { BillName, BillService, Money } from "@fin/domain";
import { BillDTO } from "../dtos/BillDTO";
import { ClearBillDueDateDTO } from "../dtos/UpdateBillDTO";
import { BillDTOMapper } from "../mappers/BillMapper";
import { ClearDueDateMutation } from "./ClearDueDateMutation";

describe("@fin/application/bill/mutations/ClearDueDateMutation", () => {
  let domainService: jest.Mocked<BillService>;

  beforeEach(() => {
    domainService = {
      clearDueDate: jest.fn(),
    } as unknown as jest.Mocked<BillService>;
    jest.clearAllMocks();
  });

  it("calls domainService.clearDueDate and returns mapped DTO", async () => {
    const mutation = new ClearDueDateMutation();

    const mockUpdatedBill = {
      id: "123",
      name: new BillName("Rent"),
      amount: new Money(100),
      dueDate: undefined,
      order: 1,
      isReoccurring: false,
      paymentSourceId: undefined,
      paymentPortalUrl: undefined,
    };

    domainService.clearDueDate.mockResolvedValue(mockUpdatedBill as any);
    const toDTOSpy = jest.spyOn(BillDTOMapper, "toDTO");

    const dto: ClearBillDueDateDTO = {
      mutationType: "clearDueDate",
      id: "123",
    };

    const result: BillDTO = await mutation.execute(dto, domainService);

    expect(domainService.clearDueDate).toHaveBeenCalledWith("123");
    expect(toDTOSpy).toHaveBeenCalledWith(mockUpdatedBill);

    const expectedDTO: BillDTO = {
      id: "123",
      name: "Rent",
      amount: 100,
      dueDate: undefined,
      order: 1,
      isReoccurring: false,
      paymentSourceId: undefined,
      paymentPortalUrl: undefined,
    };

    expect(result).toEqual(expectedDTO);
  });

  it("throws if domainService.clearDueDate rejects", async () => {
    const mutation = new ClearDueDateMutation();

    domainService.clearDueDate.mockRejectedValue(new Error("Failed"));

    const dto: ClearBillDueDateDTO = {
      mutationType: "clearDueDate",
      id: "123",
    };

    await expect(mutation.execute(dto, domainService)).rejects.toThrow(
      "Failed"
    );
  });
});
