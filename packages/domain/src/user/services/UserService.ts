import crypto from "crypto";
import { IUnitOfWork } from "../../common/IUnitOfWork";
import { User } from "../entities/User";
import { VerificationToken } from "../entities/VerificationToken";
import { IUserRepository } from "../repositories/IUserRepository";
import { IVerificationTokenRepository } from "../repositories/IVerificationTokenRepository";
import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";
import { Username } from "../value-objects/Username";

export class UserService {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenRepo: IVerificationTokenRepository,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async registerUser(
    id: string,
    username: string,
    email: string,
    plainPassword: string
  ): Promise<{ user: User; token: VerificationToken }> {
    const emailVO = Email.create(email);
    const usernameVO = Username.create(username);

    // Check if user already exists
    const existingUser = await this.userRepo.findByEmail(emailVO);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    const existingUsername = await this.userRepo.findByUsername(usernameVO);
    if (existingUsername) {
      throw new Error("Username is already taken");
    }

    // Create password and hash it
    const password = Password.createFromPlainText(plainPassword);
    const hashedPassword = await password.hash();

    // Create user
    const user = User.create(id, usernameVO, emailVO, hashedPassword);

    // Create verification token
    const tokenId = crypto.randomUUID();
    const token = VerificationToken.create(
      tokenId,
      user.getId(),
      "EMAIL_VERIFICATION"
    );

    // Save both user and token atomically
    return this.unitOfWork.execute(async () => {
      const savedUser = await this.userRepo.save(user);
      const savedToken = await this.tokenRepo.save(token);
      return { user: savedUser, token: savedToken };
    });
  }

  async verifyEmail(tokenString: string): Promise<User> {
    const token = await this.tokenRepo.findByToken(tokenString);
    if (!token) {
      throw new Error("Invalid verification token");
    }

    if (!token.isValid()) {
      throw new Error("Verification token has expired or been used");
    }

    const user = await this.userRepo.findById(token.getUserId());
    if (!user) {
      throw new Error("User not found");
    }

    // Mutate entities
    user.verifyEmail();
    token.markAsUsed();

    // Update both atomically
    return this.unitOfWork.execute(async () => {
      await this.userRepo.update(user);
      await this.tokenRepo.update(token);
      return user;
    });
  }

  async initiatePasswordReset(email: string): Promise<VerificationToken> {
    const emailVO = Email.create(email);
    const user = await this.userRepo.findByEmail(emailVO);

    if (!user) {
      throw new Error("User not found");
    }

    const tokenId = crypto.randomUUID();
    const token = VerificationToken.create(
      tokenId,
      user.getId(),
      "PASSWORD_RESET"
    );

    return this.tokenRepo.save(token);
  }

  async resetPassword(
    tokenString: string,
    newPlainPassword: string
  ): Promise<User> {
    const token = await this.tokenRepo.findByToken(tokenString);
    if (!token) {
      throw new Error("Invalid reset token");
    }

    if (!token.isValid()) {
      throw new Error("Reset token has expired or been used");
    }

    const user = await this.userRepo.findById(token.getUserId());
    if (!user) {
      throw new Error("User not found");
    }

    const newPassword = Password.createFromPlainText(newPlainPassword);
    const hashedPassword = await newPassword.hash();

    // Mutate entities
    user.changePassword(hashedPassword);
    token.markAsUsed();

    // Update both atomically
    return this.unitOfWork.execute(async () => {
      await this.userRepo.update(user);
      await this.tokenRepo.update(token);
      return user;
    });
  }

  async authenticateUser(email: string, plainPassword: string): Promise<User> {
    const emailVO = Email.create(email);
    const user = await this.userRepo.findByEmail(emailVO);

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await user.verifyPassword(plainPassword);
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return user;
  }
}
