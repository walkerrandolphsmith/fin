import type {
  DeletePaymentSourceResponseDTO,
  PaymentSourceDTO,
} from "@fin/application";

/**
 * SDK class exposing payment-source-related API methods.
 * Consumers import the singleton `paymentSourceSDK` and call methods on it, e.g.
 *   import { paymentSourceSDK } from '@fin/sdk'
 *   await paymentSourceSDK.getPaymentSources()
 */
class PaymentSourcesSDK {
  private apiBase: string;
  private headers = { "Content-Type": "application/json" };

  /**
   * Create a new PaymentSourceSDK instance.
   *
   * @param {string} [apiBase=API_BASE] - Base URL for API requests. Defaults to
   *   the module-level `API_BASE` value which reads from
   *   process.env.API_BASE_URL.
   * @example
   * const sdk = new PaymentSourceSDK('https://example.com');
   */
  constructor() {
    this.apiBase = process.env.API_BASE_URL || "";
  }

  /**
   * Retrieve all payment sources from the server.
   *
   * @returns {Promise<PaymentSourceDTO[]>} A promise that resolves to an array
   *   of PaymentSourceDTO objects.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * const sources = await paymentSourceSDK.getPaymentSources();
   */
  async getPaymentSources(): Promise<PaymentSourceDTO[]> {
    console.log("fetching payment sources", this, this.apiBase);
    const res = await fetch(`${this.apiBase}/api/paymentSources`);
    console.log("fetching payment sources", res.ok);
    if (!res.ok) throw new Error("Failed to fetch paymentSources");
    const dto = (await res.json()) as PaymentSourceDTO[];
    return dto;
  }

  /**
   * Create a new payment source on the server.
   *
   * @param {Partial<PaymentSourceDTO>} data - Partial payment source data to
   *   create. Only the fields required by the server need to be provided.
   * @returns {Promise<PaymentSourceDTO>} The created PaymentSourceDTO.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * const created = await paymentSourceSDK.createPaymentSource({ name: 'Bank' });
   */
  async createPaymentSource(
    data: Partial<PaymentSourceDTO>
  ): Promise<PaymentSourceDTO> {
    const res = await fetch(`${this.apiBase}/api/paymentSources`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create payment source");
    const dto = (await res.json()) as PaymentSourceDTO;
    return dto;
  }

  /**
   * Update an existing payment source by ID with the provided partial data.
   *
   * @param {string} paymentSourceId - The ID of the payment source to update.
   * @param {Partial<PaymentSourceDTO>} data - Partial fields to patch.
   * @returns {Promise<PaymentSourceDTO>} The updated PaymentSourceDTO.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * const updated = await paymentSourceSDK.updatePaymentSource('id', { name: 'New' });
   */
  async updatePaymentSource(
    paymentSourceId: string,
    data: Partial<PaymentSourceDTO>
  ): Promise<PaymentSourceDTO> {
    const res = await fetch(
      `${this.apiBase}/api/paymentSources/${paymentSourceId}`,
      {
        method: "PATCH",
        headers: this.headers,
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error("Failed to update payment source");
    const dto = (await res.json()) as PaymentSourceDTO;
    return dto;
  }

  /**
   * Delete a payment source by ID.
   *
   * @param {string} paymentSourceId - The ID of the payment source to delete.
   * @returns {Promise<DeletePaymentSourceResponseDTO>} Response data from delete.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * await paymentSourceSDK.deletePaymentSource('id');
   */
  async deletePaymentSource(
    paymentSourceId: string
  ): Promise<DeletePaymentSourceResponseDTO> {
    const res = await fetch(
      `${this.apiBase}/api/paymentSources/${paymentSourceId}`,
      {
        method: "DELETE",
      }
    );
    if (!res.ok) throw new Error("Failed to delete payment source");
    const dto = (await res.json()) as DeletePaymentSourceResponseDTO;
    return dto;
  }
}

/**
 * Backwards-compatible singleton instance of the PaymentSourceSDK.
 * Consumers can import { paymentSourceSDK } and call methods directly.
 *
 * @example
 * import { paymentSourceSDK } from '@fin/sdk';
 * await paymentSourceSDK.getPaymentSources();
 */
export const paymentSourcesSDK = new PaymentSourcesSDK();
