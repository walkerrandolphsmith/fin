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
  isReoccurring?: boolean;
  paymentPortal?: PaymentPortal;
  hasFixedAmount?: boolean;
}

/**
 * Domain entity representing a bill. Encapsulates bill state and behaviors
 * (mutations) and exposes read-only accessors for its properties. Use the
 * static factory methods to create or rehydrate instances.
 */
export class Bill {
  private props: BillProps;

  /**
   * Private constructor. Use `createNew` to create fresh instances or
   * `rehydrate` to restore from persisted state.
   *
   * @private
   * @param {BillProps} props - The full set of bill properties.
   */
  private constructor(props: BillProps) {
    this.props = props;
  }

  /**
   * Create a new Bill with a generated id and createdAt timestamp.
   *
   * @param {Omit<BillProps, 'id' | 'order' | 'createdAt'>} props - Initial
   *   bill properties required to instantiate a new bill.
   * @returns {Bill} A newly created Bill instance.
   */
  static createNew(
    props: Omit<BillProps, "id" | "order" | "createdAt">
  ): Bill {
    return new Bill({
      hasFixedAmount: true,
      isReoccurring: true,
      ...props,
      id: randomUUID(),
      createdAt: new Date(),
    });
  }

  /**
   * Rehydrate an existing Bill from persisted state (e.g., database record).
   *
   * @param {BillProps} props - Full props including id, createdAt and order.
   * @returns {Bill} Rehydrated Bill instance with provided state.
   */
  static rehydrate(props: BillProps): Bill {
    return new Bill(props);
  }

  /**
   * Identifier of the bill (readonly).
   * @returns {string | undefined}
   */
  get id() {
    return this.props.id;
  }
  /**
   * Human readable bill name (readonly).
   * @returns {BillName}
   */
  get name() {
    return this.props.name;
  }
  /**
   * Monetary amount associated with the bill (readonly).
   * @returns {Money}
   */
  get amount() {
    return this.props.amount;
  }
  /**
   * Optional due date for the bill (readonly).
   * @returns {Date | undefined}
   */
  get dueDate() {
    return this.props.dueDate;
  }
  /**
   * Ordering index for list rendering (readonly).
   * @returns {number | undefined}
   */
  get order() {
    return this.props.order;
  }
  /**
   * Creation timestamp (readonly).
   * @returns {Date}
   */
  get createdAt() {
    return this.props.createdAt;
  }
  /**
   * Relation to a payment source if assigned (readonly).
   * @returns {Relation | undefined}
   */
  get paymentSourceId() {
    return this.props.paymentSourceId;
  }

  /**
   * Whether the bill is recurring (readonly).
   * @returns {boolean}
   */
  get isReoccurring() {
    return this.props.isReoccurring;
  }
  /**
   * Payment portal details if available (readonly).
   * @returns {PaymentPortal | undefined}
   */
  get paymentPortal() {
    return this.props.paymentPortal;
  }
  /**
   * Whether the bill is fixed amount (readonly).
   * @returns {boolean}
   */
  get hasFixedAmount() {
    return this.props.hasFixedAmount;
  }

  /**
   * Set or clear the payment portal URL for this bill. Accepts undefined to
   * clear the portal. The method converts a raw URL string into a
   * PaymentPortal value object.
   *
   * @param {string | undefined} paymentPortalUrl - URL string or undefined to
   *   clear the portal.
   */
  setPaymentPortal(paymentPortalUrl: string | undefined) {
    this.props.paymentPortal =
      paymentPortalUrl === undefined
        ? undefined
        : PaymentPortal.fromUrl(paymentPortalUrl);
  }

  /**
   * Rename the bill.
   *
   * @param {string} newName - New human readable name for the bill.
   */
  rename(newName: string) {
    this.props.name = new BillName(newName);
  }

  /**
   * Change the monetary amount for the bill.
   *
   * @param {number} newAmount - New numeric amount.
   */
  changeAmount(newAmount: number) {
    this.props.amount = new Money(newAmount);
  }

  /**
   * Assign a payment source to this bill using the source id.
   *
   * @param {string} id - The id of the payment source to assign.
   */
  assignPaymentSource(id: string) {
    this.props.paymentSourceId = new Relation(id);
  }

  /**
   * Remove any assigned payment source from this bill.
   */
  unAssignPaymentSource() {
    this.props.paymentSourceId = undefined;
  }

  /**
   * Update the bill's due date. Pass undefined to clear the due date.
   *
   * @param {Date | undefined} date - New due date or undefined.
   */
  updateDueDate(date?: Date) {
    this.props.dueDate = date;
  }

  /**
   * Set whether the bill should be marked as recurring. Defaults to true if
   * omitted.
   *
   * @param {boolean} [isReoccurring=true] - Whether the bill is recurring.
   */
  setSchedule(isReoccurring?: boolean) {
    this.props.isReoccurring = isReoccurring ?? true;
  }

  /**
   * Set whether the bill is fixed or variable amount.
   * @param isFixed
   */
  setAmountType(hasFixedAmount: boolean) {
    this.props.hasFixedAmount = hasFixedAmount;
  }
}
