import { EntityMustHaveNameError } from "../../common/errors/EntityMustHaveNameError";

/**
 * Value object representing the human-readable name of a Bill.
 *
 * Responsibilities:
 * - Normalize the provided name (trim whitespace).
 * - Validate that a non-empty name is provided and throw a domain error when
 *   validation fails.
 */
export class BillName {
  /**
   * Create a new BillName instance.
   *
   * @param {string} name - The human readable name for the bill. Leading and
   *   trailing whitespace will be trimmed. An error is thrown for empty names.
   * @throws {EntityMustHaveNameError} When the trimmed name is empty.
   */
  constructor(public readonly name: string) {
    this.name = name.trim();
    if (this.name.length <= 0) {
      throw new EntityMustHaveNameError();
    }
  }
}
