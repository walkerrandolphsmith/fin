import {
  CreatePaymentSourceDTO,
  PaymentSourceDTOMapper,
} from "@fin/application";
import {
  EntityMustHaveNameError,
  IPaymentSourceRepository,
  PaymentSource,
} from "@fin/domain";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * tags:
 *   name: PaymentSources
 *   description: PaymentSource management
 */

/**
 * @swagger
 * /api/paymentSources:
 *   get:
 *     summary: Get all paymentSources
 *     tags: [PaymentSources]
 *     responses:
 *       200:
 *         description: List of paymentSources
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PaymentSource'
 */
export async function GET() {
  const container = await getContainer();
  const repository = container.resolve<IPaymentSourceRepository>(
    TOKENS.PaymentSourceRepository
  );
  const paymentSources = await repository.getAll();
  return NextResponse.json(paymentSources.map(PaymentSourceDTOMapper.toDTO));
}

/**
 * @swagger
 * /api/paymentSources:
 *   post:
 *     summary: Create a new paymentSource
 *     tags: [PaymentSources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentSource'
 *     responses:
 *       200:
 *         description: The created paymentSource
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaymentSource'
 */
export async function POST(request: NextRequest) {
  try {
    const container = await getContainer();
    const repository = container.resolve<IPaymentSourceRepository>(
      TOKENS.PaymentSourceRepository
    );
    const dto = (await request.json()) as CreatePaymentSourceDTO;
    const newPaymentSource: PaymentSource =
      PaymentSourceDTOMapper.fromCreateDTO(dto);

    const paymentSource = await repository.create(newPaymentSource);
    return NextResponse.json(PaymentSourceDTOMapper.toDTO(paymentSource));
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
 *     PaymentSource:
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
