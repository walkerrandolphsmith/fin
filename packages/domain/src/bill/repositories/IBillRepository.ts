import { Bill } from "../entities/Bill";

interface IDomainQuery {
  field: string;
  value: unknown;
  operator: "=";
}

interface IBillRepository {
  isValidObjectId(id: string): boolean;
  reorderBills(updates: { id: string; order: number }[]): Promise<Bill[]>;
  getAll(): Promise<Bill[]>;
  getById(id: string): Promise<Bill>;
  create(data: Bill): Promise<Bill>;
  update(updates: Partial<Bill>): Promise<Bill>;
  delete(id: string): Promise<Bill | null>;
  findWhere(query: IDomainQuery): Promise<Bill[]>;
  dispose(): Promise<void>;
}

export type { IBillRepository };
