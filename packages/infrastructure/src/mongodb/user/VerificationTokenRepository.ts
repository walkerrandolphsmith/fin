import {
  IVerificationTokenRepository,
  VerificationToken,
} from "@fin/domain/server";
import { VerificationTokenMapper } from "./VerificationTokenMapper";
import VerificationTokenModel from "./VerificationTokenModel";

export class VerificationTokenRepository
  implements IVerificationTokenRepository
{
  async save(token: VerificationToken): Promise<VerificationToken> {
    const doc = VerificationTokenMapper.toPersistence(token);
    const created = await VerificationTokenModel.create(doc);
    return VerificationTokenMapper.toDomain(created);
  }

  async update(token: VerificationToken): Promise<VerificationToken> {
    const doc = VerificationTokenMapper.toPersistence(token);
    const updated = await VerificationTokenModel.findByIdAndUpdate(
      token.getId(),
      doc,
      { new: true }
    );

    if (!updated) {
      throw new Error("Verification token not found");
    }

    return VerificationTokenMapper.toDomain(updated);
  }

  async findByToken(tokenString: string): Promise<VerificationToken | null> {
    const doc = await VerificationTokenModel.findOne({ token: tokenString });
    return doc ? VerificationTokenMapper.toDomain(doc) : null;
  }

  async findByUserId(
    userId: string,
    type: "EMAIL_VERIFICATION" | "PASSWORD_RESET"
  ): Promise<VerificationToken | null> {
    const byMostRecentUnusedToken: { [key: string]: -1 } = { createdAt: -1 };
    const doc = await VerificationTokenModel.findOne({
      userId,
      type,
      used: false,
    }).sort(byMostRecentUnusedToken);

    return doc ? VerificationTokenMapper.toDomain(doc) : null;
  }

  async delete(id: string): Promise<void> {
    await VerificationTokenModel.findByIdAndDelete(id);
  }
}
