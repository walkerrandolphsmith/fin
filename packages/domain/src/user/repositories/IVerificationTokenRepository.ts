import { VerificationToken } from "../entities/VerificationToken";

export interface IVerificationTokenRepository {
  save(token: VerificationToken): Promise<VerificationToken>;
  update(token: VerificationToken): Promise<VerificationToken>;
  findByToken(token: string): Promise<VerificationToken | null>;
  findByUserId(
    userId: string,
    type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  ): Promise<VerificationToken | null>;
  delete(id: string): Promise<void>;
}
