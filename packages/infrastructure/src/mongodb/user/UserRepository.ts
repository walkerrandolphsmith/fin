import { Email, IUserRepository, User, Username } from "@fin/domain/server";
import { UserMapper } from "./UserMapper";
import UserModel from "./UserModel";

export class UserRepository implements IUserRepository {
  async save(user: User): Promise<User> {
    const doc = await UserMapper.toPersistence(user);
    const created = await UserModel.create(doc);
    return UserMapper.toDomain(created);
  }

  async update(user: User): Promise<User> {
    const doc = await UserMapper.toPersistence(user);
    const updated = await UserModel.findByIdAndUpdate(user.getId(), doc, {
      new: true,
    });
    if (!updated) {
      throw new Error("User not found");
    }
    return UserMapper.toDomain(updated);
  }

  async findById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    const doc = await UserModel.findOne({ email: email.getValue() });
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async findByUsername(username: Username): Promise<User | null> {
    const doc = await UserModel.findOne({ username: username.getValue() });
    return doc ? UserMapper.toDomain(doc) : null;
  }

  async exists(email: Email): Promise<boolean> {
    const count = await UserModel.countDocuments({ email: email.getValue() });
    return count > 0;
  }
}
