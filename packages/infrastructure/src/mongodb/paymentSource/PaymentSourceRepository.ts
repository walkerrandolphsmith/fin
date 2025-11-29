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

/**
 * Mongoose-based repository for PaymentSource aggregate.
 *
 * Responsibilities:
 * - Convert between persistence documents and domain entities using the
 *   `PaymentSourceMapper`.
 * - Provide CRUD operations and dispose semantics.
 * - Participate in request-scoped sessions via `asyncLocalStorage` when
 *   available (used to support UnitOfWork semantics).
 */
export class PaymentSourceRepository implements IPaymentSourceRepository {
  /**
   * Validate that a string is a MongoDB ObjectId (24 hex characters).
   * @param {string} id
   * @returns {boolean}
   */
  isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Retrieve all payment sources. Respects an optional session supplied via
   * `asyncLocalStorage`.
   * @returns {Promise<PaymentSource[]>}
   */
  async getAll(): Promise<PaymentSource[]> {
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const docs = await PaymentSourceModel.find()
      .sort({ order: 1 })
      .session(session)
      .lean<IPaymentSource[]>();
    return docs.map(PaymentSourcePersistenceMapper.fromModel);
  }

  /**
   * Get a payment source by id. Validates id and throws domain errors when
   * appropriate.
   * @param {string} id
   * @returns {Promise<PaymentSource>}
   */
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

  /**
   * Create a new payment source in the persistence store.
   * @param {PaymentSource} entity
   * @returns {Promise<PaymentSource>}
   */
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

  /**
   * Update an existing payment source by id.
   * @param {string} id
   * @param {PaymentSource} entity
   * @returns {Promise<PaymentSource>}
   */
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

  /**
   * Delete a payment source by id.
   * @param {string} id
   * @returns {Promise<null>}
   */
  async delete(id: string): Promise<null> {
    if (!this.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const deleted =
      await PaymentSourceModel.findByIdAndDelete(id).session(session);
    if (!deleted) throw new EntityNotFoundError(id);
    return null;
  }

  /**
   * Dispose repository resources (disconnect mongoose client).
   * @returns {Promise<void>}
   */
  async dispose(): Promise<void> {
    return disconnectMongoose();
  }
}
