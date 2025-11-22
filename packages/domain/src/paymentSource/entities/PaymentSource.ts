import { randomUUID } from "crypto";
import { PaymentSourceName } from "../value-objects/PaymentSourceName";
import {
  PaymentSourceType,
  PaymentSourceTypeObject,
} from "../value-objects/PaymentSourceType";

export interface PaymentSourceProps {
  id: string;
  name: PaymentSourceName;
  type: PaymentSourceTypeObject;
  details?: string;
  createdAt?: Date;
}

export class PaymentSource {
  private constructor(private props: PaymentSourceProps) {}

  static createNew(
    props: Omit<PaymentSourceProps, "id" | "createdAt">
  ): PaymentSource {
    return new PaymentSource({
      id: randomUUID(),
      createdAt: new Date(),
      ...props,
    });
  }

  static rehydrate(props: PaymentSourceProps): PaymentSource {
    return new PaymentSource(props);
  }

  rename(newName: string): void {
    this.props.name = new PaymentSourceName(newName);
  }

  changeType(newType: PaymentSourceType): void {
    this.props.type = new PaymentSourceTypeObject(newType);
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get type() {
    return this.props.type;
  }
  get details() {
    return this.props.details;
  }
  get createdAt() {
    return this.props.createdAt;
  }
}
