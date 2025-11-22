import {
  BillService,
  ReorderBillsRequestDTO,
  ReorderBillsResponseDTO,
} from "@fin/application";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/bills/reorder:
 *   patch:
 *     summary: Reorder multiple bills
 *     tags: [Bills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - updates
 *             properties:
 *               updates:
 *                 type: array
 *                 description: List of bill IDs and their new order indexes
 *                 items:
 *                   type: object
 *                   required:
 *                     - id
 *                     - order
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: The bill ID
 *                     order:
 *                       type: integer
 *                       description: The new order index for the bill
 *     responses:
 *       200:
 *         description: Successfully reordered bills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bills:
 *                   type: array
 *                   description: List of updated bills
 *                   items:
 *                     $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Invalid bill IDs or request payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error while reordering bills
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
export async function PATCH(request: NextRequest) {
  try {
    const body: ReorderBillsRequestDTO = await request.json();
    const container = await getContainer();
    const service = container.resolve<BillService>(TOKENS.BillService);

    const updatedBills = await service.reorderBills(body);

    const response: ReorderBillsResponseDTO = { bills: updatedBills };
    return NextResponse.json(response);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to reorder bills" },
      { status: 500 }
    );
  }
}
