import { InvalidEntityIdError } from "../../common/errors/InvalidEntityIdError";

/**
 * Value object representing a relation to another entity by id (e.g. a
 * PaymentSource). Validates id format when provided.
 */
export class Relation {
  public readonly id?: string;

  /**
   * Construct a Relation. If an id is provided it's validated using
   * `isValidObjectId`; an invalid id will cause an `InvalidEntityIdError`.
   *
   * @param {string | undefined} id - Optional related entity id.
   * @throws {InvalidEntityIdError} When the provided id is not valid.
   */
  constructor(id?: string) {
    if (id !== undefined && !this.isValidObjectId(id)) {
      throw new InvalidEntityIdError(id);
    }
    this.id = id;
  }

  /**
   * Validate the given id using a simple 24-character hex ObjectId pattern.
   * This mirrors MongoDB ObjectId shape and is used as a lightweight
   * validation check (no I/O performed).
   *
   * @private
   * @param {string} id - Identifier to check.
   * @returns {boolean} True when the id matches the expected pattern.
   */
  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}
