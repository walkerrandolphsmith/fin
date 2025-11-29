/**
 * Error thrown when an entity is expected to have a non-empty name but the
 * provided name is empty or missing.
 *
 * @extends Error
 * @example
 * throw new EntityMustHaveNameError();
 */
export class EntityMustHaveNameError extends Error {
  constructor() {
    super(`Entity must have a name`);
    this.name = "EntityMustHaveName";
    // Ensure instanceof works correctly when transpiled to older targets
    Object.setPrototypeOf(this, EntityMustHaveNameError.prototype);
  }
}
