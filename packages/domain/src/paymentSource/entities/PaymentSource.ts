import { randomUUID } from "crypto";
import { PaymentSourceName } from "../value-objects/PaymentSourceName";
import {
  PaymentSourceType,
  PaymentSourceTypeObject,
} from "../value-objects/PaymentSourceType";

/**
 * Properties required to construct or rehydrate a PaymentSource entity.
 *
 * @typedef {Object} PaymentSourceProps
 * @property {string} id - Unique identifier for the payment source.
 * @property {PaymentSourceName} name - Value object wrapping the display name.
 * @property {PaymentSourceTypeObject} type - Value object describing the type.
 * @property {string} [details] - Optional details or connection string.
 * @property {Date} [createdAt] - Creation timestamp.
 */
export interface PaymentSourceProps {
  id: string;
  name: PaymentSourceName;
  type: PaymentSourceTypeObject;
  details?: string;
  createdAt?: Date;
}

/**
 * Aggregate root representing a payment source (bank account, card, etc.).
 *
 * Use the static factory methods to create new instances or rehydrate from
 * persisted state. The entity exposes behaviors to rename and change type and
 * readonly accessors for its properties.
 */
export class PaymentSource {
  private constructor(private props: PaymentSourceProps) {}

  /**
   * Create a new PaymentSource with a generated id and createdAt timestamp.
   *
   * @param {Omit<PaymentSourceProps, 'id' | 'createdAt'>} props - Initial
   *   properties required to create a payment source.
   * @returns {PaymentSource} Newly created PaymentSource instance.
   */
  static createNew(
    props: Omit<PaymentSourceProps, "id" | "createdAt">
  ): PaymentSource {
    return new PaymentSource({
      id: randomUUID(),
      createdAt: new Date(),
      ...props,
    });
  }

  /**
   * Rehydrate a PaymentSource from persisted properties (e.g., database record).
   *
   * @param {PaymentSourceProps} props - Full persisted properties.
   * @returns {PaymentSource} Rehydrated PaymentSource instance.
   */
  static rehydrate(props: PaymentSourceProps): PaymentSource {
    return new PaymentSource(props);
  }

  /**
   * Rename the payment source.
   *
   * @param {string} newName - New display name for the payment source.
   */
  rename(newName: string): void {
    this.props.name = new PaymentSourceName(newName);
  }

  /**
   * Change the payment source type (for example switching from bank to card)
   * by creating a new PaymentSourceTypeObject value object.
   *
   * @param {PaymentSourceType} newType - New type for the payment source.
   */
  changeType(newType: PaymentSourceType): void {
    this.props.type = new PaymentSourceTypeObject(newType);
  }

  /**
   * Unique identifier for the payment source (readonly).
   * @returns {string}
   */
  get id() {
    return this.props.id;
  }
  /**
   * Human readable name value object (readonly).
   * @returns {PaymentSourceName}
   */
  get name() {
    return this.props.name;
  }
  /**
   * Payment source type value object (readonly).
   * @returns {PaymentSourceTypeObject}
   */
  get type() {
    return this.props.type;
  }
  /**
   * Optional details string (readonly).
   * @returns {string | undefined}
   */
  get details() {
    return this.props.details;
  }
  /**
   * Creation timestamp (readonly).
   * @returns {Date | undefined}
   */
  get createdAt() {
    return this.props.createdAt;
  }
}
