import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/diagnostic/serviceInfo:
 *   get:
 *     summary: Get service information
 *     tags: [Diagnostic]
 *     responses:
 *       200:
 *         description: Returns application metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   example: "MyApp"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 */
export async function GET() {
  return NextResponse.json({
    name: process.env.NEXT_PUBLIC_APP_NAME || "Fin",
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
}
