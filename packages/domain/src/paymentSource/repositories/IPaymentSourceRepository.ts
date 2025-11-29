import { PaymentSource } from "../entities/PaymentSource";

/**
 * Repository contract for PaymentSource aggregate persistence and retrieval.
 * Implementations encapsulate storage details but expose these methods for
 * application and domain services to interact with payment sources.
 */
interface IPaymentSourceRepository {
  /**
   * Check whether the provided id is valid for the underlying store.
   * @param {string} id
   * @returns {boolean}
   */
  isValidObjectId(id: string): boolean;

  /**
   * Retrieve all payment sources.
   * @returns {Promise<PaymentSource[]>}
   */
  getAll(): Promise<PaymentSource[]>;

  /**
   * Get a payment source by id.
   * @param {string} id
   * @returns {Promise<PaymentSource>}
   */
  getById(id: string): Promise<PaymentSource>;

  /**
   * Persist a newly created payment source.
   * @param {PaymentSource} data
   * @returns {Promise<PaymentSource>}
   */
  create(data: PaymentSource): Promise<PaymentSource>;

  /**
   * Update an existing payment source by id.
   * @param {string} id
   * @param {Partial<PaymentSource>} updates
   * @returns {Promise<PaymentSource>}
   */
  update(id: string, updates: Partial<PaymentSource>): Promise<PaymentSource>;

  /**
   * Delete a payment source by id.
   * @param {string} id
   * @returns {Promise<PaymentSource | null>}
   */
  delete(id: string): Promise<PaymentSource | null>;
}

export type { IPaymentSourceRepository };
