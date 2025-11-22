import {
  BillDTO,
  BillDTOMapper,
  BillService,
  DeleteBillResponseDTO,
  UpdateBillDTO,
} from "@fin/application";
import {
  BillAmountCannotExceedThreshold,
  BillAmountMustBePositive,
  EntityMustHaveNameError,
  EntityNotFoundError,
  IBillRepository,
  InvalidEntityIdError,
  InvalidPropertiesError,
} from "@fin/domain";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/bills/{id}:
 *   get:
 *     summary: Get a bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The bill ID
 *     responses:
 *       200:
 *         description: The requested bill
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       404:
 *         description: Bill not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const container = await getContainer();
    const repository = container.resolve<IBillRepository>(
      TOKENS.BillRepository
    );
    const bill = await repository.getById(id);
    return NextResponse.json(BillDTOMapper.toDTO(bill));
  } catch (err) {
    if (err instanceof InvalidEntityIdError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof EntityNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    throw err;
  }
}

/**
 * @swagger
 * /api/bills/{id}:
 *   patch:
 *     summary: Update a bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The bill ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Bill'
 *     responses:
 *       200:
 *         description: The updated bill
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Bill'
 *       400:
 *         description: Invalid bill ID
 *       404:
 *         description: Bill not found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const container = await getContainer();
    const service = container.resolve<BillService>(TOKENS.BillService);
    const data = await request.json();
    const dto: UpdateBillDTO = { ...data, id };
    const billDto: BillDTO = await service.updateBill(dto);
    return NextResponse.json(billDto);
  } catch (err) {
    if (
      err instanceof InvalidPropertiesError ||
      err instanceof InvalidEntityIdError ||
      err instanceof BillAmountCannotExceedThreshold ||
      err instanceof BillAmountMustBePositive ||
      err instanceof EntityMustHaveNameError
    ) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    if (err instanceof EntityNotFoundError) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/bills/{id}:
 *   delete:
 *     summary: Delete a bill by ID
 *     tags: [Bills]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The bill ID
 *     responses:
 *       200:
 *         description: Successfully deleted the bill
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 id:
 *                   type: string
 *       400:
 *         description: Invalid bill ID
 *       404:
 *         description: Bill not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "Bill ID is required" },
      { status: 400 }
    );
  }

  try {
    const container = await getContainer();
    const repository = container.resolve<IBillRepository>(
      TOKENS.BillRepository
    );
    await repository.delete(id);
    const response: DeleteBillResponseDTO = { success: true, id };
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof InvalidEntityIdError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Failed to delete bill", err);
    return NextResponse.json(
      { error: "Failed to delete bill" },
      { status: 500 }
    );
  }
}
