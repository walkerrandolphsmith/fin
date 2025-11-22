import { checkDatabaseConnection } from "@fin/infrastructure";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/diagnostic/readiness:
 *   get:
 *     summary: Check if the service is ready to serve traffic
 *     tags: [Diagnostic]
 *     responses:
 *       200:
 *         description: Service is ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "ready"
 *                 dependencies:
 *                   type: object
 *                   example: { database: "ok" }
 *       503:
 *         description: Service is not ready
 */
export async function GET() {
  try {
    const dbHealthy = await checkDatabaseConnection();

    if (!dbHealthy) {
      return NextResponse.json(
        { status: "not ready", dependencies: { database: "unhealthy" } },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status: "ready",
      dependencies: { database: "ok" },
    });
  } catch (err) {
    return NextResponse.json(
      {
        status: "not ready",
        dependencies: { database: "error", error: err.message },
      },
      { status: 503 }
    );
  }
}
