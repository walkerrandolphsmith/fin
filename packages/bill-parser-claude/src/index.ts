import Anthropic from "@anthropic-ai/sdk";
import {
  BillDetails,
  IExtractBillDetailsFromPrintableDocuments,
} from "@fin/bill-parser";

/**
 * Shape of the structured response we expect from Claude after parsing.
 * Fields are optional and undefined when not present.
 */
interface ClaudeResponse {
  amount?: number;
  serviceProvider?: string;
  paymentPortal?: string;
  dueDate?: string;
}

/**
 * Parser implementation that uses Anthropic Claude to extract bill details
 * from a PDF buffer.
 *
 * Responsibilities:
 * - Send the PDF (base64) and a structured prompt to Claude.
 * - Parse the returned text as JSON and map it to the BillDetails shape.
 * - Provide conservative error handling: on any failure return a
 *   low-confidence result ({ confidence: 0 }).
 *
 * Notes:
 * - The implementation expects Claude to return JSON only (no markdown/code
 *   fences). It attempts to strip common fences before parsing.
 * - The `parseWithClaude` method contains the prompt used and implements
 *   the raw I/O with the Anthropic SDK; callers should rely on `parse` for a
 *   normalized BillDetails result.
 */
class ClaudeBillParser implements IExtractBillDetailsFromPrintableDocuments {
  /** Human readable name for this parser implementation */
  public readonly name = "anthropic-claude";

  /** Anthropic SDK client instance */
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  /**
   * Construct a new ClaudeBillParser.
   *
   * It reads the Anthropic API key from the `ANTHROPIC_API_KEY` environment
   * variable and sets a default model and token limit. No network IO occurs
   * during construction.
   */
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = "claude-sonnet-4-5-20250929";
    this.maxTokens = 1024;
  }

  /**
   * Public parse entrypoint that returns a normalized BillDetails object.
   *
   * Behavior:
   * - Calls `parseWithClaude` to obtain raw parsed fields.
   * - Computes a simple confidence score based on how many fields were
   *   successfully extracted.
   * - Logs the extracted bill details for observability and returns the
   *   result. On error, logs and returns `{ confidence: 0 }`.
   *
   * @param {Buffer} pdfBuffer - PDF bytes to parse.
   * @returns {Promise<BillDetails>} Extracted bill fields with a confidence score.
   */
  async parse(pdfBuffer: Buffer): Promise<BillDetails> {
    try {
      const result = await this.parseWithClaude(pdfBuffer);

      const extractedFields = [
        result.amount,
        result.serviceProvider,
        result.paymentPortal,
        result.dueDate,
      ].filter(
        (field) => field !== undefined && field !== null && field !== ""
      );

      const confidence = extractedFields.length / 4;

      const billDetails = {
        amount: result.amount,
        serviceProvider: result.serviceProvider,
        paymentPortal: result.paymentPortal,
        dueDate: result.dueDate,
        confidence: Math.round(confidence * 100) / 100,
      };

      console.log(billDetails);

      return billDetails;
    } catch (error) {
      console.error("Error parsing bill with Claude:", error);
      return { confidence: 0 };
    }
  }

  /**
   * Low-level helper that sends the input PDF and prompt to Claude and
   * returns the parsed JSON object. This method performs several defensive
   * steps:
   * - Encodes the PDF as base64 and includes it as a document part.
   * - Sends a focussed prompt instructing Claude to output JSON only.
   * - Accepts text responses and strips common Markdown code fences before
   *   attempting JSON.parse.
   *
   * @private
   * @param {Buffer} pdfBuffer - Raw PDF bytes to send to Claude.
   * @returns {Promise<ClaudeResponse>} Parsed fields from Claude (may be empty).
   * @throws {Error} If the Claude response is unexpected or JSON parsing fails.
   */
  private async parseWithClaude(pdfBuffer: Buffer): Promise<ClaudeResponse> {
    const prompt = `You are a bill parsing assistant. Extract the following information from this bill text and return ONLY valid JSON with no markdown, no code blocks, no explanations.

Extract these fields from the attached PDF document:
- amount: The total amount due (number, no dollar signs or commas)
- serviceProvider: The company/service provider name (string)
- paymentPortal: Any website URL for making payments (string, full URL with https://)
- dueDate: The payment due date (string, format YYYY-MM-DD)

Rules:
- If a field is not found, use null
- For amount, extract only the total due or amount due (not balance, not previous charges)
- For serviceProvider, extract the main company name at the top of the bill
- For paymentPortal, look for "pay online at", "visit", or any payment URLs
- For dueDate, look for "due date", "payment due", "please pay by"
- Always convert dueDate to ISO 8601 format YYYY-MM-DD, even if the bill uses MM/DD/YYYY or other formats.

Return JSON only:`;

    const base64Pdf = pdfBuffer.toString("base64");

    const message = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                data: base64Pdf,

                media_type: "application/pdf",

                type: "base64",
              },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    let responseText = content.text.trim();

    responseText = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "")
      .trim();

    console.log("Claude response:", responseText);

    const parsed = JSON.parse(responseText);

    return {
      amount: parsed.amount ?? undefined,
      serviceProvider: parsed.serviceProvider ?? undefined,
      paymentPortal: parsed.paymentPortal ?? undefined,
      dueDate: parsed.dueDate ?? undefined,
    };
  }
}

export { ClaudeBillParser };
