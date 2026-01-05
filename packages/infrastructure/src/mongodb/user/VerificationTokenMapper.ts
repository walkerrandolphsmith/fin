import { VerificationToken } from "@fin/domain/server";

export class VerificationTokenMapper {
  static toDomain(doc: any): VerificationToken {
    return VerificationToken.reconstitute(
      doc._id,
      doc.userId,
      doc.token,
      doc.type,
      doc.expiresAt,
      doc.used
    );
  }

  static toPersistence(token: VerificationToken): any {
    return {
      _id: token.getId(),
      userId: token.getUserId(),
      token: token.getToken(),
      type: token.getType(),
      expiresAt: token.getExpiresAt(),
      used: token.isUsed(),
    };
  }
}
