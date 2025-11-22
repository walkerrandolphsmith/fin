import { Bill, BillName, Money, PaymentPortal, Relation } from "@fin/domain";
import { Types } from "mongoose";
import { IBillModel } from "./BillModel";
export class BillPersistenceMapper {
  static fieldMap: Record<
    string,
    {
      name: string;
      type?:
        | "objectId"
        | "string"
        | "number"
        | "date"
        | "boolean"
        | "paymentPortal";
    }
  > = {
    id: { name: "_id", type: "objectId" },
    name: { name: "name", type: "string" },
    amount: { name: "amount", type: "number" },
    dueDate: { name: "dueDate", type: "date" },
    createdAt: { name: "createdAt", type: "date" },
    order: { name: "order", type: "number" },
    paymentSourceId: { name: "paymentSourceId", type: "objectId" },
    isReoccurring: { name: "isReoccurring", type: "boolean" },
    paymentPortal: { name: "paymentPortal", type: "paymentPortal" },
  };

  static toPersistenceField(domainField: string): string {
    const mapping = this.fieldMap[domainField];
    if (!mapping) throw new Error(`Unknown domain field: ${domainField}`);
    return mapping.name;
  }

  static toPersistenceValue(domainField: string, value: unknown): unknown {
    const mapping = this.fieldMap[domainField];
    if (!mapping) return value;

    switch (mapping.type) {
      case "objectId":
        if (value == null) return null;
        if (value instanceof Types.ObjectId) return value;
        if (typeof value === "string") {
          if (!Types.ObjectId.isValid(value)) {
            throw new Error(
              `Invalid ObjectId for field "${domainField}": ${value}`
            );
          }
          return new Types.ObjectId(value);
        }
        throw new Error(
          `Expected ObjectId or string for field "${domainField}", got ${typeof value}`
        );

      case "date":
        if (value == null) return null;
        if (value instanceof Date) return value;
        const date = new Date(value as string);
        if (isNaN(date.getTime())) {
          throw new Error(`Invalid date for field "${domainField}": ${value}`);
        }
        return date;

      case "paymentPortal":
        if (value == null) return undefined;
        if (value instanceof PaymentPortal) {
          return {
            type: value.type,
            value: value.value,
            metadata: value.metadata,
          };
        }
        throw new Error(
          `Expected PaymentPortal for field "${domainField}", got ${typeof value}`
        );

      default:
        return value;
    }
  }

  static fromModel(doc: IBillModel): Bill {
    return Bill.rehydrate({
      id: doc._id.toString(),
      name: new BillName(doc.name),
      amount: new Money(doc.amount),
      dueDate: doc.dueDate,
      order: doc.order,
      createdAt: doc.createdAt,
      paymentSourceId: doc.paymentSourceId
        ? new Relation((doc.paymentSourceId as Types.ObjectId).toString())
        : undefined,
      isReoccurring: doc.isReoccurring,
      paymentPortal: doc.paymentPortal
        ? new PaymentPortal({
            type: doc.paymentPortal.type,
            value: doc.paymentPortal.value,
            metadata: doc.paymentPortal.metadata,
          })
        : undefined,
    });
  }

  static toModel(bill: Bill): Partial<IBillModel> {
    return {
      name: bill.name.name,
      amount: bill.amount.amount,
      dueDate: bill.dueDate,
      order: bill.order,
      createdAt: bill.createdAt,
      paymentSourceId: bill.paymentSourceId
        ? new Types.ObjectId(bill.paymentSourceId.id)
        : null,
      isReoccurring: bill.isReoccurring,
      paymentPortal: bill.paymentPortal
        ? {
            type: bill.paymentPortal.type,
            value: bill.paymentPortal.value,
            metadata: bill.paymentPortal.metadata,
          }
        : undefined,
    };
  }
}
