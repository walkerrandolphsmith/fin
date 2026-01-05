import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";
import { Username } from "../value-objects/Username";

export class User {
  private constructor(
    private readonly id: string,
    private username: Username,
    private email: Email,
    private password: Password,
    private emailVerified: boolean
  ) {}

  static create(
    id: string,
    username: Username,
    email: Email,
    password: Password
  ): User {
    return new User(id, username, email, password, false);
  }

  static reconstitute(
    id: string,
    username: Username,
    email: Email,
    password: Password,
    emailVerified: boolean
  ): User {
    return new User(id, username, email, password, emailVerified);
  }

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.matches(plainPassword);
  }

  verifyEmail(): void {
    if (this.emailVerified) {
      throw new Error("Email is already verified");
    }
    this.emailVerified = true;
  }

  changePassword(newPassword: Password): void {
    this.password = newPassword;
  }

  getId(): string {
    return this.id;
  }

  getUsername(): Username {
    return this.username;
  }

  getEmail(): Email {
    return this.email;
  }

  getPassword(): Password {
    return this.password;
  }

  isEmailVerified(): boolean {
    return this.emailVerified;
  }
}
