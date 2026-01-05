import bcrypt from "bcrypt";

export class Password {
  private constructor(
    private readonly hashedValue: string,
    private readonly isHashed: boolean = true
  ) {}

  static createFromPlainText(plainPassword: string): Password {
    if (!plainPassword || plainPassword.length < 8) {
      throw new Error("Password must be at least 8 characters");
    }
    return new Password(plainPassword, false);
  }

  static createFromHash(hashedPassword: string): Password {
    return new Password(hashedPassword, true);
  }

  async hash(): Promise<Password> {
    if (this.isHashed) {
      return this;
    }
    const hashed = await bcrypt.hash(this.hashedValue, 10);
    return new Password(hashed, true);
  }

  async matches(plainPassword: string): Promise<boolean> {
    if (!this.isHashed) {
      throw new Error("Cannot compare unhashed password");
    }
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  getHashedValue(): string {
    if (!this.isHashed) {
      throw new Error("Password must be hashed before retrieving value");
    }
    return this.hashedValue;
  }
}
