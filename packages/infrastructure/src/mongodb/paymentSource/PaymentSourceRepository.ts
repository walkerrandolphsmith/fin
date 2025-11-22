import {
  EntityNotFoundError,
  IPaymentSourceRepository,
  InvalidEntityIdError,
  PaymentSource,
} from "@fin/domain";
import { asyncLocalStorage } from "../asyncLocalStorage";
import { disconnectMongoose } from "../db/client";
import { PaymentSourceMapper as PaymentSourcePersistenceMapper } from "./PaymentSourceMapper";
import { IPaymentSource, PaymentSourceModel } from "./PaymentSourceModel";

export class PaymentSourceRepository implements IPaymentSourceRepository {
  isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  async getAll(): Promise<PaymentSource[]> {
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const docs = await PaymentSourceModel.find()
      .sort({ order: 1 })
      .session(session)
      .lean<IPaymentSource[]>();
    return docs.map(PaymentSourcePersistenceMapper.fromModel);
  }

  async getById(id: string): Promise<PaymentSource> {
    if (!this.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const doc = await PaymentSourceModel.findById(id)
      .session(session)
      .lean<IPaymentSource>();
    if (!doc) throw new EntityNotFoundError(id);

    return PaymentSourcePersistenceMapper.fromModel(doc);
  }

  async create(entity: PaymentSource): Promise<PaymentSource> {
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const model = PaymentSourcePersistenceMapper.toModel(entity);
    const [newDoc] = await PaymentSourceModel.create([{ ...model }], {
      session,
    });
    const newEntity = PaymentSourcePersistenceMapper.fromModel(newDoc);
    return newEntity;
  }

  async update(id: string, entity: PaymentSource): Promise<PaymentSource> {
    if (!this.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const updated = await PaymentSourceModel.findByIdAndUpdate(
      id,
      PaymentSourcePersistenceMapper.toModel(entity),
      {
        new: true,
      }
    )
      .session(session)
      .lean<IPaymentSource>();

    if (!updated) throw new EntityNotFoundError(id);
    return PaymentSourcePersistenceMapper.fromModel(updated);
  }

  async delete(id: string): Promise<null> {
    if (!this.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const deleted =
      await PaymentSourceModel.findByIdAndDelete(id).session(session);
    if (!deleted) throw new EntityNotFoundError(id);
    return null;
  }

  async dispose(): Promise<void> {
    return disconnectMongoose();
  }
}
