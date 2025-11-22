import { BillDTOMapper } from "@/bill/mappers/BillMapper";
import { AssignPaymentSourceMutation } from "@/bill/mutations/AssignPaymentSourceMutation";
import { BillService } from "@fin/domain";
import { AssignPaymentSourceDTO } from "../dtos/UpdateBillDTO";

jest.mock("@/bill/mappers/BillMapper", () => ({
  BillDTOMapper: {
    toDTO: jest.fn(),
  },
}));

describe("@fin/application mutations AssignPaymentSourceMutation", () => {
  const VALID_ID = "507f1f77bcf86cd799439011";
  const VALID_PAYMENT_SOURCE_ID = "507f191e810c19729de860ea";

  let mutation: AssignPaymentSourceMutation;
  let domainService: jest.Mocked<BillService>;

  beforeEach(() => {
    mutation = new AssignPaymentSourceMutation();

    domainService = {
      assignPaymentSource: jest.fn(),
    } as unknown as jest.Mocked<BillService>;
  });

  it("calls BillService.assignPaymentSource and maps the result", async () => {
    const dto: AssignPaymentSourceDTO = {
      mutationType: "assignPaymentSource",
      id: VALID_ID,
      paymentSourceId: VALID_PAYMENT_SOURCE_ID,
    };

    const mockBill = { id: VALID_ID, name: "Internet" } as any;

    domainService.assignPaymentSource.mockResolvedValue(mockBill);

    const mappedDTO = { id: VALID_ID, name: "Internet", amount: 100 };
    (BillDTOMapper.toDTO as jest.Mock).mockReturnValue(mappedDTO);

    const result = await mutation.execute(dto, domainService);

    expect(domainService.assignPaymentSource).toHaveBeenCalledWith(
      VALID_ID,
      VALID_PAYMENT_SOURCE_ID
    );

    expect(BillDTOMapper.toDTO).toHaveBeenCalledWith(mockBill);

    expect(result).toEqual(mappedDTO);
  });
});
