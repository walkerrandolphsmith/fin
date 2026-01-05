import {
  CostTier,
  EmailError,
  EmailMessage,
  EmailSendResult,
  IEmailSender,
  RetryableEmailError,
} from "@fin/email-sender";
import FormData from "form-data";
import Mailgun from "mailgun.js";

export class MailgunEmailProvider implements IEmailSender {
  readonly name = "Mailgun";
  readonly costTier = CostTier.CHEAP;

  constructor(
    private apiKey: string,
    private domain: string
  ) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    try {
      const mailgun = new Mailgun(FormData);
      const client = mailgun.client({
        username: "api",
        key: this.apiKey,
      });

      await client.messages.create(this.domain, {
        from: message.from,
        to: message.to,
        subject: message.subject,
        text: message.body,
        html: message.html,
      });

      return {
        messageId: `mailgun-${Date.now()}`,
        provider: this.name,
        timestamp: new Date(),
      };
    } catch (error: any) {
      throw this.mapError(error);
    }
  }

  private mapError(error: Error): EmailError {
    const msg = error.message.toLowerCase();

    if (msg.includes("quota") || msg.includes("limit")) {
      return new RetryableEmailError(
        `Mailgun quota exceeded`,
        this.name,
        120000, // 2 minutes
        error
      );
    }

    return new RetryableEmailError(
      `Mailgun error: ${error.message}`,
      this.name,
      undefined,
      error
    );
  }
}
