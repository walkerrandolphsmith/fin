export class EntityMustHaveNameError extends Error {
  constructor() {
    super(`Entity must have a name`);
    this.name = "EntityMustHaveName";
  }
}
