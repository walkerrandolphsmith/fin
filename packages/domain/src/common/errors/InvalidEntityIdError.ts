/**
 * Error thrown when an entity id does not match the expected format.
 *
 * @extends Error
 * @param {string} id - The invalid id to include in the error message.
 * @example
 * throw new InvalidEntityIdError('bad-id');
 */
export class InvalidEntityIdError extends Error {
  constructor(id: string) {
    super(`Invalid ID: ${id}`);
    this.name = "InvalidEntityIdError";
    Object.setPrototypeOf(this, InvalidEntityIdError.prototype);
  }
}
