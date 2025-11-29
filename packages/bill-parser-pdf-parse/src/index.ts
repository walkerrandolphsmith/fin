import type {
  BillDetails,
  IExtractBillDetailsFromPrintableDocuments,
} from "@fin/bill-parser";
import pdfParse from "pdf-parse";

interface ExtractedField<T> {
  value: T | undefined;
  confidence: number;
}

const KNOWN_PROVIDERS = [
  "Georgia Power",
  "Comcast",
  "Xfinity",
  "AT&T",
  "Verizon",
  "Spectrum",
  "T-Mobile",
  "Sprint",
  "Southern Company",
  "Arrow Exterminators",
  "Gymnastics Unlimited",
];

const PROVIDER_PATTERNS = [
  /(?:from|billed by|provider|company)[:\s]*([A-Z][A-Za-z\s&.]+(?:Inc|LLC|Corp|Company|Co)?)/i,
  /^([A-Z][A-Z\s&.]{2,}(?:Inc|LLC|Corp|Company|Co|Energy|Electric|Gas|Water|Telecom|Mobile|Internet|Exterminators|Pest|Gymnastics)?)\s*$/m,
  /((?:AT&T|Verizon|Comcast|Xfinity|Georgia Power|Spectrum|T-Mobile|Sprint|Arrow Exterminators|Gymnastics Unlimited))/i,
];

const AMOUNT_PATTERNS = [
  /(?:total\s+(?:amount\s+)?due|amount\s+due|balance\s+due|please\s+pay)[:\s]*\$?([\d,]+\.?\d{0,2})/i,
  /(?:current\s+charges|new\s+charges|total\s+current)[:\s]*\$?([\d,]+\.?\d{0,2})/i,
  /(?:pay\s+this\s+amount|payment\s+due)[:\s]*\$?([\d,]+\.?\d{0,2})/i,
  /\$\s*([\d,]+\.\d{2})(?:\s*(?:due|total))/i,
  /(?:^|\s)\$([\d,]+\.\d{2})(?:\s|$)/gm,
  /(?:^|\s)\$([\d,]+(?:\.\d{1,2})?)(?:\s|$)/gm,
];

const PORTAL_PATTERNS = [
  /(?:pay\s+(?:online\s+)?at|visit|go\s+to)[:\s]*((?:https?:\/\/)?[\w.-]+\.(?:com|net|org|gov)(?:\/[\w./-]*)?)/i,
  /(?:website|portal|online)[:\s]*((?:https?:\/\/)?[\w.-]+\.(?:com|net|org|gov)(?:\/[\w./-]*)?)/i,
  /((?:https?:\/\/)?(?:www\.)?[\w.-]+\.(?:com|net|org)\/(?:pay|bill|account|payment)[\w./-]*)/i,
  /((?:https?:\/\/)?pay\.[\w.-]+\.(?:com|net|org))/i,
];

const DUE_DATE_PATTERNS = [
  /please\s*pay\s*by[\s:]*([A-Za-z]{3,9}\.?[\s]*\d{1,2}[\s,]*\d{4})/i,
  /due\s*date[\s:]*([A-Za-z]{3,9}\.?[\s]*\d{1,2}[\s,]*\d{4})/i,
  /([A-Za-z]{3,9}\.?[\s]*\d{1,2}[\s,]*\d{4})/i,
  /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/,
];

class PdfTextBillParser implements IExtractBillDetailsFromPrintableDocuments {
  public readonly name = "pdf-parse";

  private async extractText(pdfBuffer: Buffer): Promise<string> {
    const result = await pdfParse(pdfBuffer);
    return result.text;
  }

  async parse(pdfBuffer: Buffer): Promise<BillDetails> {
    const fullText = await this.extractText(pdfBuffer);
    const amount = this.extractAmount(fullText);
    const provider = this.extractProvider(fullText);
    const portal = this.extractPaymentPortal(fullText);
    const dueDate = this.extractDueDate(fullText);

    const confidences = [
      amount.confidence,
      provider.confidence,
      portal.confidence,
      dueDate.confidence,
    ];

    const overall =
      confidences.reduce((a, b) => a + b, 0) / confidences.length;

    return {
      amount: amount.value,
      serviceProvider: provider.value,
      paymentPortal: portal.value,
      dueDate: dueDate.value,
      confidence: Math.round(overall * 100) / 100,
    };
  }

  private extractAmount(text: string): ExtractedField<number> {
    const amounts: Array<{ value: number; confidence: number }> = [];

    for (let i = 0; i < AMOUNT_PATTERNS.length; i++) {
      const pattern = AMOUNT_PATTERNS[i];
      const flags = pattern.flags.includes("g")
        ? pattern.flags
        : pattern.flags + "g";
      const regex = new RegExp(pattern.source, flags);
      const matches = text.matchAll(regex);

      for (const match of matches) {
        const raw = match[1];
        if (!raw) continue;

        const value = parseFloat(raw.replace(/,/g, ""));
        if (isNaN(value) || value <= 0 || value >= 100000) continue;

        const patternConfidence = 1 - i * 0.15;

        const rangeConfidence = value >= 10 && value <= 5000 ? 1 : 0.7;

        const pos = match.index ?? text.indexOf(match[0]);
        const posRatio = pos / text.length;
        const positionConfidence =
          posRatio > 0.6 ? 1 : posRatio > 0.4 ? 0.85 : 0.6;

        const combined =
          patternConfidence * rangeConfidence * positionConfidence;

        amounts.push({ value, confidence: combined });
      }
    }

    if (amounts.length === 0) return { value: undefined, confidence: 0 };

    amounts.sort((a, b) => b.confidence - a.confidence);
    return amounts[0];
  }

  private extractProvider(text: string): ExtractedField<string> {
    const clean = (v: string) =>
      v
        .trim()
        .replace(/\s+/g, " ")
        .replace(/[^\w\s&.-]/g, "")
        .trim();

    for (const prov of KNOWN_PROVIDERS) {
      const reg = new RegExp(prov.replace(/[-/\\^$*+?.()|[\]{}]/g, ""), "i");
      if (reg.test(text)) return { value: prov, confidence: 0.99 };
    }

    const header = text.slice(0, 600);
    const lines = header
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const badKeywords = [
      "invoice",
      "customer",
      "instructions",
      "precautions",
      "total",
      "amount",
      "tax",
      "balance",
      "page",
      "printed",
    ];

    const businessKeywords = [
      "electric",
      "power",
      "energy",
      "utility",
      "gas",
      "water",
      "internet",
      "cable",
      "wireless",
      "mobile",
      "exterminators",
      "pest",
      "gymnastics",
      "billing",
      "services",
      "company",
      "inc",
      "llc",
    ];

    const candidateScores: Array<{ line: string; score: number }> = [];

    for (const line of lines) {
      const cleaned = clean(line);

      if (!cleaned) continue;
      if (cleaned.length < 3) continue;

      if (badKeywords.some((w) => cleaned.toLowerCase().includes(w))) continue;

      if (!/^[A-Z]/.test(cleaned)) continue;

      let score = 0;
      if (
        /Inc|LLC|Company|Co\.|Corp|Exterminators|Gymnastics|Power|Electric/i.test(
          cleaned
        )
      )
        score += 0.6;

      if (businessKeywords.some((w) => cleaned.toLowerCase().includes(w)))
        score += 0.3;

      if (cleaned.split(" ").length <= 5) score += 0.2;

      if (score > 0.3) candidateScores.push({ line: cleaned, score });
    }

    candidateScores.sort((a, b) => b.score - a.score);
    if (candidateScores.length > 0)
      return {
        value: candidateScores[0].line,
        confidence: candidateScores[0].score,
      };

    for (let i = 0; i < PROVIDER_PATTERNS.length; i++) {
      const match = text.match(PROVIDER_PATTERNS[i]);
      if (match?.[1]) {
        const cleaned = clean(match[1]);
        return { value: cleaned, confidence: 0.45 };
      }
    }

    return { value: undefined, confidence: 0 };
  }

  private extractDueDate(text: string): ExtractedField<string> {
    const normalize = (v: string) =>
      v
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .trim();

    for (let i = 0; i < DUE_DATE_PATTERNS.length; i++) {
      const match = DUE_DATE_PATTERNS[i].exec(text);
      if (match?.[1]) {
        return { value: normalize(match[1]), confidence: 1 - i * 0.15 };
      }
    }
    return { value: undefined, confidence: 0 };
  }

  private extractPaymentPortal(text: string): ExtractedField<string> {
    for (let i = 0; i < PORTAL_PATTERNS.length; i++) {
      const match = text.match(PORTAL_PATTERNS[i]);
      if (!match?.[1]) continue;

      let url = match[1].trim().toLowerCase();

      url = url
        .replace(/\s+/g, "")
        .replace(/[oO](?=\.\w)/g, "0")
        .replace(/[lI](?=\.\w)/g, "1");

      if (!url.startsWith("http")) url = "https://" + url;

      try {
        new URL(url);
        return { value: url, confidence: 1 - i * 0.15 };
      } catch {}
    }

    return { value: undefined, confidence: 0 };
  }
}

export { PdfTextBillParser };
