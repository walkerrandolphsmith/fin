export class Email {
  private constructor(private readonly value: string) {}

  static create(email: string): Email {
    if (!email || !this.isValid(email)) {
      throw new Error("Invalid email address");
    }
    return new Email(email.toLowerCase().trim());
  }

  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
