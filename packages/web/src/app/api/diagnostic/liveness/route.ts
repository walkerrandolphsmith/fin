import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/diagnostic/liveness:
 *   get:
 *     summary: Check if the service is alive
 *     tags: [Diagnostic]
 *     responses:
 *       200:
 *         description: Service is alive
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 alive:
 *                   type: boolean
 *                   example: true
 */
export async function GET() {
  return NextResponse.json({ alive: true });
}
