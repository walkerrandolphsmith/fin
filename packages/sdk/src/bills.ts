import type {
  BillDTO,
  BillFilter,
  DeleteBillResponseDTO,
  ReorderBillsResponseDTO,
} from "@fin/application";

/**
 * SDK class exposing bill-related API methods.
 * Consumers import the singleton `billSDK` and call methods on it, e.g.
 *   import { billSDK } from '@fin/sdk'
 *   await billSDK.getBills()
 */
class BillSDK {
  private apiBase: string;
  private headers = { "Content-Type": "application/json" };

  /**
   * Create a new BillSDK instance.
   *
   * @param {string} [apiBase=API_BASE] - Base URL for API requests. Defaults to
   *   the module-level `API_BASE` value which reads from
   *   process.env.API_BASE_URL.
   * @example
   * const sdk = new BillSDK('https://example.com');
   */
  constructor() {
    this.apiBase = process.env.API_BASE_URL || "";
  }

  /**
   * Retrieve bills from the server optionally filtered by the provided filter.
   *
   * Note: the `filter` value is stringified directly into the query string in
   * the current implementation. If `BillFilter` is an object, callers should
   * ensure it is converted appropriately before passing, or the SDK can be
   * extended to serialize objects.
   *
   * @param {BillFilter} [filter] - Optional filter applied to the list API.
   * @returns {Promise<BillDTO[]>} A promise that resolves to an array of
   *   BillDTO objects.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * const bills = await billSDK.getBills();
   */
  async getBills(filter?: BillFilter): Promise<BillDTO[]> {
    const queryParameters = filter ? `?filter=${filter}` : "";
    const res = await fetch(`${this.apiBase}/api/bills${queryParameters}`);
    if (!res.ok) throw new Error("Failed to fetch bills");
    const dto = (await res.json()) as BillDTO[];
    return dto;
  }

  /**
   * Create a new bill record on the server.
   *
   * @param {Partial<BillDTO>} data - Partial bill data to create. Only the
   *   fields required by the server need to be provided.
   * @returns {Promise<BillDTO>} The created BillDTO returned by the API.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * const created = await billSDK.createBill({ amount: 12.34 });
   */
  async createBill(data: Partial<BillDTO>): Promise<BillDTO> {
    const res = await fetch(`${this.apiBase}/api/bills`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create bill");
    const dto = (await res.json()) as BillDTO;
    return dto;
  }

  /**
   * Update an existing bill by ID with the provided partial data.
   *
   * @param {string} billId - The ID of the bill to update.
   * @param {Partial<BillDTO>} data - Partial bill fields to patch.
   * @returns {Promise<BillDTO>} The updated BillDTO as returned by the API.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * const updated = await billSDK.updateBill('abc123', { amount: 20 });
   */
  async updateBill(billId: string, data: Partial<BillDTO>): Promise<BillDTO> {
    const res = await fetch(`${this.apiBase}/api/bills/${billId}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update bill");
    const dto = (await res.json()) as BillDTO;
    return dto;
  }

  /**
   * Delete a bill by ID.
   *
   * @param {string} billId - The ID of the bill to delete.
   * @returns {Promise<DeleteBillResponseDTO>} Response information from delete.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * await billSDK.deleteBill('abc123');
   */
  async deleteBill(billId: string): Promise<DeleteBillResponseDTO> {
    const res = await fetch(`${this.apiBase}/api/bills/${billId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete bill");
    const dto = (await res.json()) as DeleteBillResponseDTO;
    return dto;
  }

  /**
   * Reorder bills on the server. The server expects an array of updates. This
   * SDK maps the provided array to the server shape (current implementation
   * sets order based on the array index).
   *
   * @param {{ id: string; order: number }[]} updates - Array of update objects
   *   where each item contains an id and desired order.
   * @returns {Promise<ReorderBillsResponseDTO>} The server response DTO.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * await billSDK.reorderBills([{ id: 'a', order: 0 }, { id: 'b', order: 1 }]);
   */
  async reorderBills(
    updates: { id: string; order: number }[]
  ): Promise<ReorderBillsResponseDTO> {
    const res = await fetch(`${this.apiBase}/api/bills/reorder`, {
      method: "PATCH",
      body: JSON.stringify({
        updates: updates.map((b, i) => ({ id: b.id, order: i })),
      }),
      headers: this.headers,
    });
    if (!res.ok) throw new Error("Failed to reorder bills");
    const dto = (await res.json()) as ReorderBillsResponseDTO;
    return dto;
  }

  /**
   * Import a bill from a file-like object (File, Blob or Buffer). The file is
   * sent as multipart/form-data under the `file` key.
   *
   * @param {File|Blob|Buffer} file - The file or binary blob to upload.
   * @returns {Promise<BillDTO>} The created BillDTO returned by the import
   *   endpoint.
   * @throws {Error} If the network request fails or the response is not OK.
   * @example
   * const created = await billSDK.importFrom(fileInput.files[0]);
   */
  async importFrom(file: File | Blob | Buffer): Promise<BillDTO> {
    const formData = new FormData();
    formData.append("file", file as any);

    const res = await fetch(`${this.apiBase}/api/bills/import`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Failed to import bill");
    }

    return (await res.json()) as BillDTO;
  }
}

/**
 * Backwards-compatible singleton instance of the BillSDK.
 * Consumers can import { billSDK } and call methods directly.
 *
 * @example
 * import { billSDK } from '@fin/sdk';
 * await billSDK.getBills();
 */
export const billSDK = new BillSDK();
