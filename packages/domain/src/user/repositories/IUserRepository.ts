import { User } from "../entities/User";
import { Email } from "../value-objects/Email";
import { Username } from "../value-objects/Username";

export interface IUserRepository {
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  exists(email: Email): Promise<boolean>;
}
