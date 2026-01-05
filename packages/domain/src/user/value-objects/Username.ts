export class Username {
  private constructor(private readonly value: string) {}

  static create(username: string): Username {
    if (!username || username.length < 3) {
      throw new Error("Username must be at least 3 characters");
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new Error(
        "Username can only contain letters, numbers, hyphens, and underscores"
      );
    }
    return new Username(username.toLowerCase().trim());
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}
