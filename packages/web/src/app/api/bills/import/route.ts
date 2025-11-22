import { BillService } from "@fin/application";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/bills/parse:
 *   post:
 *     summary: Parse an uploaded bill PDF and extract billing details
 *     description: Accepts a PDF upload and returns extracted bill metadata including amount, provider, portal, and due date.
 *     tags: [Bills]
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The PDF file to be parsed
 *               metadata:
 *                 type: string
 *                 description: Optional JSON metadata (stringified)
 *                 example: '{"source":"mobile-app"}'
 *
 *     responses:
 *       200:
 *         description: Successfully parsed the bill
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 amount:
 *                   type: number
 *                   example: 82.14
 *                 serviceProvider:
 *                   type: string
 *                   example: "Georgia Power"
 *                 paymentPortal:
 *                   type: string
 *                   example: "https://payment.georgiapower.com"
 *                 dueDate:
 *                   type: string
 *                   example: "Dec 1, 2025"
 *                 confidence:
 *                   type: number
 *                   description: Confidence score 0–1
 *                   example: 0.92
 *
 *       400:
 *         description: Missing file or invalid upload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing PDF file upload"
 *
 *       500:
 *         description: Server error while parsing PDF
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to parse uploaded bill"
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "Missing PDF file upload" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const container = await getContainer();
    const billService: BillService = container.resolve(TOKENS.BillService);
    const billDTO = await billService.extractFromBuffer(buffer);
    const response = billDTO;
    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to reorder bills" },
      { status: 500 }
    );
  }
}
