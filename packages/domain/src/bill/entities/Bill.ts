import { randomUUID } from "crypto";
import { BillName } from "../value-objects/BillName";
import { Money } from "../value-objects/Money";
import { PaymentPortal } from "../value-objects/PaymentPortal";
import { Relation } from "../value-objects/Relation";

export interface BillProps {
  id?: string;
  name: BillName;
  amount: Money;
  dueDate?: Date;
  order?: number;
  createdAt: Date;
  paymentSourceId?: Relation;
  isReoccurring: boolean;
  paymentPortal?: PaymentPortal;
}

export class Bill {
  private props: BillProps;

  private constructor(props: BillProps) {
    this.props = props;
  }

  static createNew(
    props: Omit<BillProps, "id" | "order" | "createdAt">
  ): Bill {
    return new Bill({
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
      isReoccurring: true,
    });
  }

  static rehydrate(props: BillProps): Bill {
    return new Bill(props);
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get amount() {
    return this.props.amount;
  }
  get dueDate() {
    return this.props.dueDate;
  }
  get order() {
    return this.props.order;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get paymentSourceId() {
    return this.props.paymentSourceId;
  }

  get isReoccurring() {
    return this.props.isReoccurring;
  }
  get paymentPortal() {
    return this.props.paymentPortal;
  }

  setPaymentPortal(paymentPortalUrl: string | undefined) {
    this.props.paymentPortal =
      paymentPortalUrl === undefined
        ? undefined
        : PaymentPortal.fromUrl(paymentPortalUrl);
  }

  rename(newName: string) {
    this.props.name = new BillName(newName);
  }

  changeAmount(newAmount: number) {
    this.props.amount = new Money(newAmount);
  }

  assignPaymentSource(id: string) {
    this.props.paymentSourceId = new Relation(id);
  }

  unAssignPaymentSource() {
    this.props.paymentSourceId = undefined;
  }

  updateDueDate(date?: Date) {
    this.props.dueDate = date;
  }

  setSchedule(isReoccurring?: boolean) {
    this.props.isReoccurring = isReoccurring ?? true;
  }
}
