import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/diagnostic/healthcheck:
 *   get:
 *     summary: Check if the service is healthy
 *     tags: [Diagnostic]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ok"
 *                 uptimeSeconds:
 *                   type: number
 *                   example: 12345
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    uptimeSeconds: process.uptime(),
  });
}
