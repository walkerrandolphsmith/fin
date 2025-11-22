export class EntityNotFoundError extends Error {
  constructor(id: string) {
    super(`Entity with ID ${id} not found`);
    this.name = "EntityNotFoundError";
  }
}
