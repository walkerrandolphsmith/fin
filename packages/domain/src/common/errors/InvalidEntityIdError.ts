export class InvalidEntityIdError extends Error {
  constructor(id: string) {
    super(`Invalid ID: ${id}`);
    this.name = "InvalidEntityIdError";
  }
}
