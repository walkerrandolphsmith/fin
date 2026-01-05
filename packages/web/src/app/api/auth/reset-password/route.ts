// packages/web/src/app/api/auth/reset-password/route.ts
import { UserService } from "@fin/application";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset user password
 *     description: |
 *       Resets a user's password using a valid reset token.
 *       Marks the reset token as used after successful reset.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *                 description: Password reset token from reset email
 *                 example: 550e8400-e29b-41d4-a716-446655440000-a1b2c3d4
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: New password (minimum 8 characters)
 *                 example: NewSecurePassword123!
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation (must match password)
 *                 example: NewSecurePassword123!
 *     responses:
 *       200:
 *         description: Password successfully reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid token or passwords don't match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Passwords do not match
 */
export async function POST(request: NextRequest) {
  try {
    const container = await getContainer();
    const userService = container.resolve<UserService>(TOKENS.UserService);

    const body = await request.json();
    const user = await userService.resetPassword(body);

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Password reset failed",
      },
      { status: 400 }
    );
  }
}
