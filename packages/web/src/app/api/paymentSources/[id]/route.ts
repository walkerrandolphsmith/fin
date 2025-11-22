import {
  DeletePaymentSourceResponseDTO,
  PaymentSourceDTO,
  PaymentSourceDTOMapper,
  PaymentSourceService,
  UpdatePaymentSourceDTO,
} from "@fin/application";
import {
  PaymentSourceService as DomainService,
  EntityMustHaveNameError,
  EntityNotFoundError,
  InvalidEntityIdError,
  IPaymentSourceRepository,
} from "@fin/domain";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/paymentSources/{id}:
 *   get:
 *     summary: Get a paymentSource by ID
 *     tags: [PaymentSources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The paymentSource ID
 *     responses:
 *       200:
 *         description: The requested paymentSource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentSource'
 *       404:
 *         description: PaymentSource not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const container = await getContainer();
    const repository = container.resolve<IPaymentSourceRepository>(
      TOKENS.PaymentSourceRepository
    );

    const paymentSource = await repository.getById(id);
    return NextResponse.json(PaymentSourceDTOMapper.toDTO(paymentSource));
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
 * /api/paymentSources/{id}:
 *   patch:
 *     summary: Update a paymentSource by ID
 *     tags: [PaymentSources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The paymentSource ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentSource'
 *     responses:
 *       200:
 *         description: The updated paymentSource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentSource'
 *       400:
 *         description: Invalid paymentSource ID
 *       404:
 *         description: PaymentSource not found
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const data = await request.json();
    const container = await getContainer();
    const service = container.resolve<PaymentSourceService>(
      TOKENS.PaymentSourceService
    );
    const dto: UpdatePaymentSourceDTO = { ...data, id };

    const paymentSourceDto: PaymentSourceDTO =
      await service.updatePaymentSource(dto);
    return NextResponse.json(paymentSourceDto);
  } catch (err) {
    if (
      err instanceof InvalidEntityIdError ||
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
 * /api/paymentSources/{id}:
 *   delete:
 *     summary: Delete a paymentSource by ID
 *     tags: [PaymentSources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The paymentSource ID
 *     responses:
 *       200:
 *         description: Successfully deleted the paymentSource
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
 *         description: Invalid paymentSource ID
 *       404:
 *         description: PaymentSource not found
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      { error: "PaymentSource ID is required" },
      { status: 400 }
    );
  }

  try {
    const container = await getContainer();
    const paymentSourceService = container.resolve<DomainService>(
      TOKENS.PaymentSourceDomainService
    );

    await paymentSourceService.delete(id);
    const response: DeletePaymentSourceResponseDTO = { success: true, id };
    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof InvalidEntityIdError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("Failed to delete paymentSource", err);
    return NextResponse.json(
      { error: "Failed to delete paymentSource" },
      { status: 500 }
    );
  }
}
