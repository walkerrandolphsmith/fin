export interface BillDetails {
  amount?: number;
  serviceProvider?: string;
  paymentPortal?: string;
  dueDate?: string;
  confidence: number;
}

export interface IParseBillDocument {
  name: string;
  parse(pdfBuffer: Buffer): Promise<BillDetails>;
}

class BillParserDecorator implements IParseBillDocument {
  public readonly name: string = "bill-parser-decorator";
  private parsers: IParseBillDocument[] = [];

  constructor(parsers: IParseBillDocument[] = []) {
    this.parsers.push(...parsers);
  }

  async parse(pdfBuffer: Buffer): Promise<BillDetails> {
    if (this.parsers.length === 0) {
      throw new Error("No parsers registered");
    }

    const results = await Promise.all(
      this.parsers.map((parser) => parser.parse(pdfBuffer))
    );

    const valid = results
      .filter((r): r is BillDetails => r !== undefined)
      .sort((a, b) => b.confidence - a.confidence);

    return valid[0] ?? { confidence: 0 };
  }
}

export { BillParserDecorator };
