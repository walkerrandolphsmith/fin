import crypto from "crypto";

export class VerificationToken {
  private constructor(
    private readonly id: string,
    private readonly userId: string,
    private readonly token: string,
    private readonly type: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
    private readonly expiresAt: Date,
    private used: boolean = false
  ) {}

  static create(
    id: string,
    userId: string,
    type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  ): VerificationToken {
    const token = this.generateToken(userId);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

    return new VerificationToken(id, userId, token, type, expiresAt, false);
  }

  static reconstitute(
    id: string,
    userId: string,
    token: string,
    type: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
    expiresAt: Date,
    used: boolean
  ): VerificationToken {
    return new VerificationToken(id, userId, token, type, expiresAt, used);
  }

  private static generateToken(userId: string): string {
    const randomBytes = crypto.randomBytes(32).toString("hex");
    return `${userId}-${randomBytes}`;
  }

  isValid(): boolean {
    return !this.used && new Date() < this.expiresAt;
  }

  markAsUsed(): void {
    if (this.used) {
      throw new Error("Token has already been used");
    }
    if (!this.isValid()) {
      throw new Error("Token has expired");
    }
    this.used = true;
  }

  getId(): string {
    return this.id;
  }

  getUserId(): string {
    return this.userId;
  }

  getToken(): string {
    return this.token;
  }

  getType(): "EMAIL_VERIFICATION" | "PASSWORD_RESET" {
    return this.type;
  }

  getExpiresAt(): Date {
    return this.expiresAt;
  }

  isUsed(): boolean {
    return this.used;
  }
}
