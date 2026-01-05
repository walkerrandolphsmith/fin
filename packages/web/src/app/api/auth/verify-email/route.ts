import { UserService } from "@fin/application";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Verify user email address
 *     description: |
 *       Verifies a user's email address using the token sent via email.
 *       Marks both the user's email as verified and the token as used.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Email verification token from verification email
 *                 example: 550e8400-e29b-41d4-a716-446655440000-a1b2c3d4
 *     responses:
 *       200:
 *         description: Email successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Verification token has expired or been used
 */
export async function POST(request: NextRequest) {
  try {
    const container = await getContainer();
    const userService = container.resolve<UserService>(TOKENS.UserService);

    const body = await request.json();
    const user = await userService.verifyEmail(body);

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Verification failed",
      },
      { status: 400 }
    );
  }
}
