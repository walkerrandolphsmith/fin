/**
 * Represents extracted bill details returned by bill parsers.
 *
 * Fields are optional because parsers may only be able to extract a subset of
 * information. The `confidence` field indicates how confident the parser is in
 * the provided values and is used by the decorator to choose the best result.
 *
 * @typedef {Object} BillDetails
 * @property {number} [amount] - The numeric amount due on the bill (if parsed).
 * @property {string} [serviceProvider] - The name of the service provider.
 * @property {string} [paymentPortal] - URL or identifier of the payment portal.
 * @property {string} [dueDate] - Due date string as extracted from the document.
 * @property {number} confidence - Confidence score (higher is better). Parsers
 *   should return a value in the range [0, 1] where 0 indicates no confidence.
 */
export interface BillDetails {
  amount?: number;
  serviceProvider?: string;
  paymentPortal?: string;
  dueDate?: string;
  confidence: number;
}

/**
 * Contract for implementations that can extract bill details from printable
 * documents (PDF buffers).
 *
 * Implementations must provide a stable `name` string and an async `parse`
 * method which accepts a Buffer and resolves to a `BillDetails` object. The
 * `parse` implementation should never throw for expected input; instead, it
 * may return a low-confidence result if extraction fails. The decorator that
 * composes multiple parsers uses the `confidence` value to pick the best result.
 *
 * @interface IExtractBillDetailsFromPrintableDocuments
 */
export interface IExtractBillDetailsFromPrintableDocuments {
  /**
   * Human readable identifier for the parser implementation.
   */
  name: string;

  /**
   * Parse a PDF buffer and return extracted bill details.
   *
   * @param {Buffer} pdfBuffer - Buffer containing the PDF bytes to parse.
   * @returns {Promise<BillDetails>} Promise resolving to the extracted
   *   bill details. If parsing cannot extract meaningful data, return a
   *   `BillDetails` object with `confidence` set to 0.
   */
  parse(pdfBuffer: Buffer): Promise<BillDetails>;
}
