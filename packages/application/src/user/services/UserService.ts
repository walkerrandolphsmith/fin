import { UserService as DomainService } from "@fin/domain/server";
import { EmailMessageFactory, IEmailSender } from "@fin/email-sender";
import { InitiatePasswordResetDTO } from "../dtos/InitiatePasswordResetDTO";
import { LoginDTO } from "../dtos/LoginDTO";
import { RegisterUserDTO } from "../dtos/RegisterUserDTO";
import { ResetPasswordDTO } from "../dtos/ResetPasswordDTO";
import { UserDTO } from "../dtos/UserDTO";
import { VerifyEmailDTO } from "../dtos/VerifyEmailDTO";
import { UserDTOMapper } from "../mappers/UserMapper";

export class UserService {
  constructor(
    private readonly userService: DomainService,
    private readonly emailService: IEmailSender
  ) {}

  async register(dto: RegisterUserDTO): Promise<UserDTO> {
    const id = crypto.randomUUID();
    const { user, token } = await this.userService.registerUser(
      id,
      dto.username,
      dto.email,
      dto.password
    );

    const message = EmailMessageFactory.createVerifyEmailMessage(
      user.getEmail().getValue(),
      token.getToken(),
      "https://localhost:3000"
    );

    await this.emailService.send(message);

    return UserDTOMapper.toDTO(user);
  }

  async login(dto: LoginDTO): Promise<UserDTO> {
    const user = await this.userService.authenticateUser(
      dto.email,
      dto.password
    );
    return UserDTOMapper.toDTO(user);
  }

  async verifyEmail(dto: VerifyEmailDTO): Promise<UserDTO> {
    const user = await this.userService.verifyEmail(dto.token);
    return UserDTOMapper.toDTO(user);
  }

  async initiatePasswordReset(dto: InitiatePasswordResetDTO): Promise<void> {
    const token = await this.userService.initiatePasswordReset(dto.email);

    await this.emailService.sendPasswordResetEmail(
      dto.email,
      token.getToken()
    );
  }

  async resetPassword(dto: ResetPasswordDTO): Promise<UserDTO> {
    if (dto.password !== dto.confirmPassword) {
      throw new Error("Passwords do not match");
    }

    const user = await this.userService.resetPassword(dto.token, dto.password);
    return UserDTOMapper.toDTO(user);
  }
}
