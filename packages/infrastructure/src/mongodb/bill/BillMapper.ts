import { Bill, BillName, Money, PaymentPortal, Relation } from "@fin/domain";
import { Types } from "mongoose";
import { IBillModel } from "./BillModel";

/**
 * Mapper responsible for converting between the Domain `Bill` entity and the
 * persistence model used by the MongoDB/Mongoose layer (`IBillModel`).
 *
 * Responsibilities:
 * - Provide a canonical mapping from domain field names to persistence field
 *   names and types (`fieldMap`).
 * - Convert individual domain values to persistence-compatible values
 *   (e.g. string -> ObjectId, value objects -> plain JSON) and vice versa.
 * - Construct domain entities from Mongoose documents (`fromModel`) and
 *   convert domain entities to partial models suitable for saving (`toModel`).
 *
 * Usage:
 *   const model = BillPersistenceMapper.toModel(domainBill);
 *   const domain = BillPersistenceMapper.fromModel(mongooseDoc);
 */
export class BillPersistenceMapper {
  /**
   * Mapping definition that maps domain property names to persistence field
   * names and indicates how values for those fields should be handled.
   */
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

  /**
   * Convert a domain field name to the corresponding persistence field name.
   *
   * @param {string} domainField - Domain property name (e.g. 'id', 'name').
   * @returns {string} Persistence field name (e.g. '_id', 'name').
   * @throws {Error} When the domain field is not known in the mapping.
   */
  static toPersistenceField(domainField: string): string {
    const mapping = this.fieldMap[domainField];
    if (!mapping) throw new Error(`Unknown domain field: ${domainField}`);
    return mapping.name;
  }

  /**
   * Convert a domain-side value into a persistence-friendly representation
   * based on the mapping for the provided domain field.
   *
   * Handles conversions such as:
   * - string -> Types.ObjectId for objectId fields
   * - Date parsing for date fields
   * - Value object serialization (PaymentPortal -> plain object)
   *
   * @param {string} domainField - The domain field name being converted.
   * @param {unknown} value - The domain value to convert.
   * @returns {unknown} The persistence-compatible value.
   * @throws {Error} When the value cannot be converted to the expected type.
   */
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

  /**
   * Rehydrate a domain `Bill` entity from a persistence model (Mongoose doc).
   *
   * @param {IBillModel} doc - Mongoose document representing the persisted bill.
   * @returns {Bill} Rehydrated domain Bill instance.
   */
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

  /**
   * Convert a domain `Bill` into a partial persistence model suitable for
   * insertion or update with Mongoose.
   *
   * @param {Bill} bill - Domain Bill instance to convert.
   * @returns {Partial<IBillModel>} Plain object matching the IBillModel shape.
   */
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
