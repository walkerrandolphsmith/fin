import { User } from "@fin/domain/server";
import { UserDTO } from "../dtos/UserDTO";

export class UserDTOMapper {
  static toDTO(user: User): UserDTO {
    return {
      id: user.getId(),
      username: user.getUsername().getValue(),
      email: user.getEmail().getValue(),
      emailVerified: user.isEmailVerified(),
    };
  }
}
