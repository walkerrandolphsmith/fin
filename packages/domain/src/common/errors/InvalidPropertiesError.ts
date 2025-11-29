/**
 * Generic error indicating that provided properties for an entity are invalid.
 *
 * This error can be thrown by value objects or factories when required
 * properties are missing or malformed.
 *
 * @extends Error
 * @example
 * throw new InvalidPropertiesError();
 */
export class InvalidPropertiesError extends Error {
  constructor() {
    super();
    this.name = "InvalidPropertiesError";
    Object.setPrototypeOf(this, InvalidPropertiesError.prototype);
  }
}
