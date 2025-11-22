import {
  Bill,
  EntityNotFoundError,
  IBillRepository,
  InvalidEntityIdError,
} from "@fin/domain";
import { asyncLocalStorage } from "../asyncLocalStorage";
import { disconnectMongoose } from "../db/client";
import { BillPersistenceMapper } from "./BillMapper";
import { BillModel, IBillModel } from "./BillModel";

export class BillRepository implements IBillRepository {
  isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async getAll(): Promise<Bill[]> {
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const docs = await BillModel.find()
      .sort({ order: 1 })
      .session(session)
      .lean<IBillModel[]>();
    return docs.map(BillPersistenceMapper.fromModel);
  }

  async getById(id: string): Promise<Bill> {
    if (!this.isValidObjectId(id)) throw new InvalidEntityIdError(id);
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const doc = await BillModel.findById(id)
      .session(session)
      .lean<IBillModel>();
    if (!doc) throw new EntityNotFoundError(id);

    return BillPersistenceMapper.fromModel(doc);
  }

  async create(bill: Bill): Promise<Bill> {
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const last = await BillModel.findOne()
      .session(session)
      .sort({ order: -1 })
      .lean();
    const nextOrder = (last?.order ?? 0) + 1;

    const [newDoc] = await BillModel.create(
      [
        {
          ...BillPersistenceMapper.toModel(bill),
          order: nextOrder,
        },
      ],
      { session }
    );

    return BillPersistenceMapper.fromModel(newDoc);
  }

  async update(bill: Bill): Promise<Bill> {
    if (!bill.id) throw new InvalidEntityIdError("undefined");
    if (!this.isValidObjectId(bill.id))
      throw new InvalidEntityIdError(bill.id);

    const model = BillPersistenceMapper.toModel(bill);
    const setObj: Record<string, any> = {};
    const unsetObj: Record<string, "" | 1> = {};
    Object.entries(model).forEach(([k, v]) => {
      if (v === undefined) {
        unsetObj[k] = "";
      } else {
        setObj[k] = v;
      }
    });
    const updateStatement: any = {};
    if (Object.keys(setObj).length) updateStatement.$set = setObj;
    if (Object.keys(unsetObj).length) updateStatement.$unset = unsetObj;

    const context = asyncLocalStorage.getStore();
    const session = context?.session;

    const updated = await BillModel.findByIdAndUpdate(
      bill.id,
      updateStatement,
      {
        new: true,
        session,
      }
    ).lean<IBillModel>();

    if (!updated) throw new EntityNotFoundError(bill.id);
    const updatedEntity = BillPersistenceMapper.fromModel(updated);
    return updatedEntity;
  }

  async delete(id: string): Promise<null> {
    if (!this.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;

    const deleted = await BillModel.findByIdAndDelete(id).session(session);
    if (!deleted) throw new EntityNotFoundError(id);
    return null;
  }

  async reorderBills(bills: { id: string; order: number }[]): Promise<Bill[]> {
    const context = asyncLocalStorage.getStore();
    const session = context?.session;
    const ops = bills.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order } },
      },
    }));
    await BillModel.bulkWrite(ops, { session });
    return this.getAll();
  }

  async findWhere(query: {
    field: string;
    value: unknown;
    operator: "=";
  }): Promise<Bill[]> {
    const { field, value, operator } = query;

    if (operator !== "=") {
      throw new Error(`Unsupported operator: ${operator}`);
    }

    const persistenceField = BillPersistenceMapper.toPersistenceField(field);
    const persistenceValue = BillPersistenceMapper.toPersistenceValue(
      field,
      value
    );
    const mongoQuery = { [persistenceField]: persistenceValue };
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const models = await BillModel.find(mongoQuery)
      .session(session)
      .lean<IBillModel[]>();

    return models.map(BillPersistenceMapper.fromModel);
  }

  async dispose(): Promise<void> {
    return disconnectMongoose();
  }
}
