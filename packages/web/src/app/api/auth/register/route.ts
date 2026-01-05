import { UserService } from "@fin/application";
import { getContainer, TOKENS } from "@fin/ioc";
import { NextRequest, NextResponse } from "next/server";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User authentication and registration
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: |
 *       Creates a new user account with the provided credentials.
 *       Sends a verification email to the provided email address.
 *       Username and email are normalized to lowercase.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 pattern: '^[a-zA-Z0-9_-]+$'
 *                 description: Username (letters, numbers, hyphens, underscores only)
 *                 example: johndoe
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Valid email address
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Password (minimum 8 characters)
 *                 example: SecurePassword123!
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User with this email already exists
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const container = await getContainer();
    const userService = container.resolve<UserService>(TOKENS.UserService);
    const user = await userService.register(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - id
 *         - username
 *         - email
 *         - emailVerified
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the user
 *           example: 550e8400-e29b-41d4-a716-446655440000
 *         username:
 *           type: string
 *           description: User's username (lowercase)
 *           example: johndoe
 *         email:
 *           type: string
 *           format: email
 *           description: User's email address (lowercase)
 *           example: john@example.com
 *         emailVerified:
 *           type: boolean
 *           description: Whether the user's email has been verified
 *           example: false
 */
