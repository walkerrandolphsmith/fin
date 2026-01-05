import { UserService } from "@fin/application";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     description: |
 *       Sends a password reset email to the user's email address.
 *       Returns success even if email doesn't exist (prevents email enumeration).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email address to send reset link to
 *                 example: john@example.com
 *     responses:
 *       200:
 *         description: Password reset email sent (or email doesn't exist)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Invalid email format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Invalid email address
 */
export async function POST(request: NextRequest) {
  try {
    const container = await getContainer();
    const userService = container.resolve<UserService>(TOKENS.UserService);

    const body = await request.json();
    await userService.initiatePasswordReset(body);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Request failed" },
      { status: 400 }
    );
  }
}
