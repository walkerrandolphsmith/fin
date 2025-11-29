/**
 * Error thrown when an entity with the requested id cannot be found.
 *
 * @extends Error
 * @param {string} id - The id that was not found (included in message).
 * @example
 * throw new EntityNotFoundError('abc123');
 */
export class EntityNotFoundError extends Error {
  constructor(id: string) {
    super(`Entity with ID ${id} not found`);
    this.name = "EntityNotFoundError";
    Object.setPrototypeOf(this, EntityNotFoundError.prototype);
  }
}
