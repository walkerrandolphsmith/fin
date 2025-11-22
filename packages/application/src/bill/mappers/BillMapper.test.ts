import { Bill, BillName, Money, PaymentPortal, Relation } from "@fin/domain";
import { BillDTOMapper } from "./BillMapper";

describe("@sdk/application/bill/mappers/BillDTOMapper", () => {
  beforeEach(async () => {
    jest.resetModules();
  });

  it("toDTO maps a full Bill domain object to BillDTO", () => {
    const bill = Bill.rehydrate({
      id: "123",
      name: new BillName("Rent"),
      amount: new Money(1500),
      dueDate: new Date("2025-02-15"),
      order: 3,
      paymentSourceId: new Relation("507f1f77bcf86cd799439011"),
      isReoccurring: true,
      paymentPortal: new PaymentPortal({
        type: "url",
        value: "https://portal.example.com",
      }),
      createdAt: new Date(),
    });

    const dto = BillDTOMapper.toDTO(bill);

    expect(dto).toEqual({
      id: "123",
      name: "Rent",
      amount: 1500,
      dueDate: "2025-02-15",
      order: 3,
      paymentSourceId: "507f1f77bcf86cd799439011",
      isReoccurring: true,
      paymentPortalUrl: "https://portal.example.com",
    });
  });

  it("toDTO maps undefined values correctly (dueDate, paymentSource, portal)", () => {
    const bill = Bill.rehydrate({
      id: "abc",
      name: new BillName("Water"),
      amount: new Money(25),
      order: undefined,
      paymentSourceId: undefined,
      paymentPortal: undefined,
      dueDate: undefined,
      isReoccurring: false,
      createdAt: new Date(),
    });

    const dto = BillDTOMapper.toDTO(bill);

    expect(dto).toEqual({
      id: "abc",
      name: "Water",
      amount: 25,
      dueDate: undefined,
      order: Infinity,
      paymentSourceId: undefined,
      isReoccurring: false,
      paymentPortalUrl: undefined,
    });
  });

  it("fromCreateDTO creates a new Bill from minimal CreateBillDTO", () => {
    const dto = {
      name: "Groceries",
    };

    const bill = BillDTOMapper.fromCreateDTO(dto);

    expect(bill).toBeInstanceOf(Bill);
    expect(bill.name.name).toBe("Groceries");
    expect(bill.amount.amount).toBe(0);
    expect(bill.isReoccurring).toBe(true);
  });

  it("fromReorderBillDTO rehydrates a Bill with new order + id", () => {
    const dto = {
      id: "reordered-1",
      order: 10,
    };

    const bill = BillDTOMapper.fromReorderBillDTO(dto);

    expect(bill).toBeInstanceOf(Bill);
    expect(bill.id).toBe("reordered-1");
    expect(bill.order).toBe(10);

    expect(bill.name.name).toBe("ephemeral");
    expect(bill.amount.amount).toBe(0);
  });
});
