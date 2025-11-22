import {
  BillDTO,
  BillDTOMapper,
  BillFilter,
  BillService,
  CreateBillDTO,
} from "@fin/application";
import { EntityMustHaveNameError, IBillRepository } from "@fin/domain";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Bill management
 */

/**
 * @swagger
 * /api/bills:
 *   get:
 *     summary: Get bills (optionally filtered)
 *     description: |
 *       Retrieves all bills, or filters them based on the provided query parameter.
 *       Currently supported filters:
 *       - `dueThisWeek`: Returns bills that have a due date within the current week.
 *       - `dueNextWeek`: Returns bills that have a due date within the next week.
 *     tags: [Bills]
 *     parameters:
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [dueThisWeek, dueNextWeek]
 *         required: false
 *         description: Optional filter to apply to the bills.
 *     responses:
 *       200:
 *         description: List of bills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bill'
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filter = searchParams.get("filter") ?? undefined;
  const container = await getContainer();
  const service = container.resolve<BillService>(TOKENS.BillService);
  const bills: BillDTO[] = await service.getBills(filter as BillFilter);
  return NextResponse.json(bills);
}

/**
 * @swagger
 * /api/bills:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bills]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bill'
 *     responses:
 *       200:
 *         description: The created bill
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 */
export async function POST(request: NextRequest) {
  try {
    const dto: CreateBillDTO = await request.json();
    const container = await getContainer();
    const repository = container.resolve<IBillRepository>(
      TOKENS.BillRepository
    );
    const newBill = BillDTOMapper.fromCreateDTO(dto);
    const bill = await repository.create(newBill);
    return NextResponse.json(BillDTOMapper.toDTO(bill));
  } catch (err) {
    if (err instanceof EntityMustHaveNameError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Bill:
 *       type: object
 *       required:
 *         - name
 *         - amount
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         amount:
 *           type: number
 *         dueDate:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 */
