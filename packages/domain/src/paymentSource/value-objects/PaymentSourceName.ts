import { EntityMustHaveNameError } from "../../common/errors/EntityMustHaveNameError";

/**
 * Value object representing the human-readable name of a PaymentSource.
 *
 * Trims whitespace and validates that a non-empty name is provided.
 */
export class PaymentSourceName {
  /**
   * Create a new PaymentSourceName value object.
   *
   * @param {string} name - Display name for the payment source. Leading and
   *   trailing whitespace will be trimmed; an error is thrown for empty names.
   * @throws {EntityMustHaveNameError} When the trimmed name is empty.
   */
  constructor(public readonly name: string) {
    this.name = name.trim();
    if (this.name.length <= 0) {
      throw new EntityMustHaveNameError();
    }
  }
}
