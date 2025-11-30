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

/**
 * Mongoose-backed repository implementation for the Bill aggregate.
 *
 * Responsibilities:
 * - Convert between domain `Bill` entities and Mongoose `IBillModel` documents
 *   using `BillPersistenceMapper`.
 * - Provide standard CRUD operations and batch reorder support.
 * - Integrate with the infrastructure's `asyncLocalStorage` to participate in
 *   request-scoped transactions/sessions when available.
 *
 * Error semantics:
 * - Validation of incoming ids is performed and `InvalidEntityIdError` is
 *   thrown for malformed ids.
 * - When an entity cannot be found for a given id methods typically throw
 *   `EntityNotFoundError`.
 */
export class BillRepository implements IBillRepository {
  /**
   * Check whether the provided identifier is a valid MongoDB ObjectId string.
   * This is a synchronous, in-memory validation and does not perform any I/O.
   *
   * @param {string} id - Candidate id string to validate.
   * @returns {boolean} True when the id matches the 24-hex-character pattern.
   */
  isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Retrieve all bills ordered by their `order` field.
   *
   * The method respects an optional session supplied via `asyncLocalStorage`
   * (used to support UnitOfWork/transaction scopes in the infra layer).
   *
   * @returns {Promise<Bill[]>} Promise resolving to an array of domain Bills.
   */
  async getAll(): Promise<Bill[]> {
    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;
    const docs = await BillModel.find()
      .sort({ order: 1 })
      .session(session)
      .lean<IBillModel[]>();
    return docs.map(BillPersistenceMapper.fromModel);
  }

  /**
   * Retrieve a single bill by id.
   *
   * Throws `InvalidEntityIdError` when id is malformed, and
   * `EntityNotFoundError` when no document exists for the id.
   *
   * @param {string} id - Identifier of the bill to fetch.
   * @returns {Promise<Bill>} Promise resolving to the found Bill.
   */
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

  /**
   * Persist a newly created Bill. The repository computes the next `order`
   * value based on the current maximum order in the collection and inserts
   * the document inside the active session when present.
   *
   * @param {Bill} bill - Domain bill to persist.
   * @returns {Promise<Bill>} Persisted bill rehydrated from the created doc.
   */
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

  /**
   * Update an existing bill. The method builds a `$set`/`$unset` update
   * statement from the provided domain model and performs a findByIdAndUpdate
   * using the active session if present.
   *
   * Throws `InvalidEntityIdError` for malformed ids and `EntityNotFoundError`
   * when the target document does not exist.
   *
   * @param {Bill} bill - Domain bill containing updated values (must include id).
   * @returns {Promise<Bill>} The updated domain bill after persistence.
   */
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

  /**
   * Delete a bill by id. Validates the id and throws `EntityNotFoundError` if
   * the document was not found.
   *
   * @param {string} id - Identifier of the bill to delete.
   * @returns {Promise<null>} Resolves to null on successful deletion.
   */
  async delete(id: string): Promise<null> {
    if (!this.isValidObjectId(id)) throw new InvalidEntityIdError(id);

    const context = asyncLocalStorage.getStore();
    const session = context?.session ?? null;

    const deleted = await BillModel.findByIdAndDelete(id).session(session);
    if (!deleted) throw new EntityNotFoundError(id);
    return null;
  }

  /**
   * Batch update ordering for multiple bills using MongoDB bulkWrite and then
   * return the updated full collection.
   *
   * @param {{ id: string; order: number }[]} bills - Array of id/order pairs.
   * @returns {Promise<Bill[]>} The reloaded list of bills after reorder.
   */
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

  /**
   * Find bills matching a simple equality domain query.
   *
   * The method uses `BillPersistenceMapper` to translate a domain field name
   * and value into a MongoDB query value. Only the `=` operator is supported
   * by this repository implementation.
   *
   * @param {{ field: string; value: unknown; operator: '=' }} query - Query shape.
   * @returns {Promise<Bill[]>} Matching bills converted to domain entities.
   */
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

  /**
   * Dispose repository resources. This implementation disconnects the
   * underlying Mongoose client.
   *
   * @returns {Promise<void>} Promise resolving once resources are cleaned up.
   */
  async dispose(): Promise<void> {
    return disconnectMongoose();
  }
}
