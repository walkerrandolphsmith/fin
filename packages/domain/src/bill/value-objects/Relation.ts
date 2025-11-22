import { InvalidEntityIdError } from "../../common/errors/InvalidEntityIdError";

export class Relation {
  public readonly id?: string;

  constructor(id?: string) {
    if (id !== undefined && !this.isValidObjectId(id)) {
      throw new InvalidEntityIdError(id);
    }
    this.id = id;
  }

  private isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}
