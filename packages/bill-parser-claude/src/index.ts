import Anthropic from "@anthropic-ai/sdk";
import {
  BillDetails,
  IExtractBillDetailsFromPrintableDocuments,
} from "@fin/bill-parser";

interface ClaudeResponse {
  amount?: number;
  serviceProvider?: string;
  paymentPortal?: string;
  dueDate?: string;
}

class ClaudeBillParser implements IExtractBillDetailsFromPrintableDocuments {
  public readonly name = "anthropic-claude";
  private client: Anthropic;
  private model: string;
  private maxTokens: number;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
    this.model = "claude-sonnet-4-5-20250929";
    this.maxTokens = 1024;
  }

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
