import { Email, Password, User, Username } from "@fin/domain/server";

export class UserMapper {
  static toDomain(doc: any): User {
    return User.reconstitute(
      doc._id,
      Username.create(doc.username),
      Email.create(doc.email),
      Password.createFromHash(doc.password),
      doc.emailVerified
    );
  }

  static async toPersistence(user: User): Promise<any> {
    return {
      _id: user.getId(),
      username: user.getUsername().getValue(),
      email: user.getEmail().getValue(),
      password: user.getPassword().getHashedValue(),
      emailVerified: user.isEmailVerified(),
    };
  }
}
