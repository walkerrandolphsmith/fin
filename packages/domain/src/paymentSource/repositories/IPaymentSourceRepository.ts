import { PaymentSource } from "../entities/PaymentSource";

interface IPaymentSourceRepository {
  isValidObjectId(id: string): boolean;
  getAll(): Promise<PaymentSource[]>;
  getById(id: string): Promise<PaymentSource>;
  create(data: PaymentSource): Promise<PaymentSource>;
  update(id: string, updates: Partial<PaymentSource>): Promise<PaymentSource>;
  delete(id: string): Promise<PaymentSource | null>;
}

export type { IPaymentSourceRepository };
