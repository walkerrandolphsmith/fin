import { Bill } from "../entities/Bill";

/**
 * Simple domain query shape used by repository lookup helpers.
 *
 * @typedef {Object} IDomainQuery
 * @property {string} field - The name of the field to query on.
 * @property {unknown} value - The value to compare the field against.
 * @property {"="} operator - Comparison operator. Currently only `=` is supported.
 */
interface IDomainQuery {
  field: string;
  value: unknown;
  operator: "=";
}

/**
 * Interface describing the contract for repositories that persist and retrieve
 * Bill aggregates. Implementations should encapsulate storage details (e.g.
 * MongoDB, in-memory, SQL) while exposing these methods for use by domain
 * services and application layers.
 */
interface IBillRepository {
  /**
   * Determine whether the provided identifier is a valid storage-specific id
   * (for example a MongoDB ObjectId). This is a synchronous helper and does
   * not perform any I/O.
   *
   * @param {string} id - Candidate identifier to validate.
   * @returns {boolean} True when the id is valid for the underlying store.
   */
  isValidObjectId(id: string): boolean;

  /**
   * Update the ordering of multiple bills in a single operation.
   *
   * @param {{ id: string; order: number }[]} updates - Array of id/order pairs.
   * @returns {Promise<Bill[]>} Promise resolving to the updated bill collection.
   */
  reorderBills(updates: { id: string; order: number }[]): Promise<Bill[]>;

  /**
   * Retrieve all bills from storage.
   *
   * @returns {Promise<Bill[]>} A promise resolving to the list of bills.
   */
  getAll(): Promise<Bill[]>;

  /**
   * Get a single bill by its id.
   *
   * @param {string} id - Bill identifier.
   * @returns {Promise<Bill>} Promise resolving to the bill. Implementations may
   *   throw or return a rejected promise if not found depending on design.
   */
  getById(id: string): Promise<Bill>;

  /**
   * Persist a newly created bill.
   *
   * @param {Bill} data - Bill instance to persist.
   * @returns {Promise<Bill>} The persisted bill (may include generated fields).
   */
  create(data: Bill): Promise<Bill>;

  /**
   * Persist changes to an existing bill.
   *
   * @param {Partial<Bill>} updates - Partial bill data containing changes.
   * @returns {Promise<Bill>} The updated bill after persistence.
   */
  update(updates: Partial<Bill>): Promise<Bill>;

  /**
   * Delete a bill by id.
   *
   * @param {string} id - Identifier of the bill to delete.
   * @returns {Promise<Bill | null>} The deleted bill if returned by the
   *   underlying store, or null if nothing was deleted.
   */
  delete(id: string): Promise<Bill | null>;

  /**
   * Find bills matching a simple domain query.
   *
   * @param {IDomainQuery} query - Domain query describing field, operator and value.
   * @returns {Promise<Bill[]>} Array of bills that match the query.
   */
  findWhere(query: IDomainQuery): Promise<Bill[]>;

  /**
   * Dispose of any resources held by the repository (connections, etc.).
   *
   * @returns {Promise<void>} Promise that resolves once resources are cleaned up.
   */
  dispose(): Promise<void>;
}

export type { IBillRepository };
