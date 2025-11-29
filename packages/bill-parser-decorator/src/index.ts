import {
  BillDetails,
  IExtractBillDetailsFromPrintableDocuments,
} from "@fin/bill-parser";

/**
 * Decorator that composes multiple bill parser implementations.
 *
 * It attempts to run all configured parsers concurrently and selects the result
 * with the highest `confidence` value. If no parsers are provided or none
 * succeed, it throws or returns a default low-confidence result depending on
 * the failure mode.
 */
class BillParserDecorator
  implements IExtractBillDetailsFromPrintableDocuments
{
  /** Human readable name for this decorator */
  public readonly name: string = "bill-parser-decorator";
  private parsers: IExtractBillDetailsFromPrintableDocuments[] = [];

  /**
   * Create a new decorator composed of the provided parsers.
   *
   * Parsers are executed concurrently when `parse` is called.
   *
   * @param {IExtractBillDetailsFromPrintableDocuments[]} [parsers=[]]
   */
  constructor(parsers: IExtractBillDetailsFromPrintableDocuments[] = []) {
    this.parsers.push(...parsers);
  }

  /**
   * Parse the provided PDF buffer using all registered parsers and return the
   * most confident result.
   *
   * Behavior:
   * - If no parsers are registered, throws an Error.
   * - Invokes all parsers concurrently and waits for them to settle.
   * - Filters successful results and sorts by `confidence` descending.
   * - Returns the highest-confidence result or a default object with
   *   `confidence: 0` if no valid results are available.
   *
   * @param {Buffer} pdfBuffer - Buffer containing the PDF to parse.
   * @returns {Promise<BillDetails>} The best parser result or a low-confidence
   *   default result.
   * @throws {Error} If no parsers have been registered.
   */
  async parse(pdfBuffer: Buffer): Promise<BillDetails> {
    if (this.parsers.length === 0) {
      throw new Error("No parsers registered");
    }

    const promises = await Promise.allSettled(
      this.parsers.map((parser) => parser.parse(pdfBuffer))
    );

    // Observability: print out each parser's name, status, confidence and details.
    // We keep allSettled behaviour so each parser runs concurrently and failures
    // do not short-circuit other parsers.
    promises.forEach((p, idx) => {
      const parser = this.parsers[idx];
      if (p.status === "fulfilled") {
        const result = p.value;
        try {
          console.log(
            `[bill-parser] parser=${parser.name} status=fulfilled confidence=${result?.confidence ?? 0} details=${JSON.stringify(
              result
            )}`
          );
        } catch (err) {
          // Defensive: JSON.stringify may throw on circular refs
          console.log(
            `[bill-parser] parser=${parser.name} status=fulfilled confidence=${result?.confidence ?? 0} details=<unserializable>`
          );
        }
      } else {
        // Rejection case: log the reason for debugging
        console.error(
          `[bill-parser] parser=${parser?.name ?? idx} status=rejected reason=`,
          (p as PromiseRejectedResult).reason
        );
      }
    });

    const valid = promises
      .filter(
        (p): p is PromiseFulfilledResult<BillDetails> =>
          p.status === "fulfilled"
      )
      .map((p) => p.value)
      .filter((r): r is BillDetails => r !== undefined)
      .sort((a, b) => b.confidence - a.confidence);

    const selected = valid[0] ?? { confidence: 0 };

    // Log selected result for traceability
    if (selected && selected.confidence > 0) {
      try {
        console.log(
          `[bill-parser] selected confidence=${selected.confidence} details=${JSON.stringify(
            selected
          )}`
        );
      } catch (err) {
        console.log(
          `[bill-parser] selected confidence=${selected.confidence} details=<unserializable>`
        );
      }
    } else {
      console.log(
        "[bill-parser] no valid parser results, returning default low-confidence result"
      );
    }

    return selected;
  }
}

export { BillParserDecorator };
