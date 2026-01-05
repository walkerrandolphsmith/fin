export interface EmailMessage {
  from: string;
  to: string[];
  subject: string;
  body: string;
  html?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailSendResult {
  messageId: string;
  provider: string;
  timestamp: Date;
}

export abstract class EmailError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RetryableEmailError extends EmailError {
  constructor(
    message: string,
    provider: string,
    public readonly retryAfterMs?: number,
    originalError?: Error
  ) {
    super(message, provider, originalError);
  }
}

export class FatalEmailError extends EmailError {
  constructor(message: string, provider: string, originalError?: Error) {
    super(message, provider, originalError);
  }
}

export class AllProvidersFailedError extends Error {
  constructor(
    message: string,
    public readonly errors: EmailError[]
  ) {
    super(message);
    this.name = "AllProvidersFailedError";
  }
}

export enum CostTier {
  FREE = "free",
  CHEAP = "cheap",
  PAID = "paid",
  PREMIUM = "premium",
}

export interface CostConfig {
  allowedTiers: Set<CostTier>;
  maxCostTier?: CostTier;
}

export interface IEmailSender {
  /**
   * Human readable identifier for the email sender implementation.
   */
  name: string;

  send(message: EmailMessage): Promise<EmailSendResult>;
  readonly costTier: CostTier;
}

export enum EmailEventType {
  PROVIDER_ATTEMPTED = "provider_attempted",
  PROVIDER_FAILED = "provider_failed",
  PROVIDER_SUCCEEDED = "provider_succeeded",
  FALLBACK_TRIGGERED = "fallback_triggered",
  CIRCUIT_OPENED = "circuit_opened",
  CIRCUIT_CLOSED = "circuit_closed",
  CIRCUIT_HALF_OPEN = "circuit_half_open",
}

export interface EmailEvent {
  type: EmailEventType;
  timestamp: Date;
  provider: string;
  message?: EmailMessage;
  error?: EmailError;
  result?: EmailSendResult;
  metadata?: Record<string, unknown>;
}

export interface EmailEventEmitter {
  emit(event: EmailEvent): void;
}

export class ConsoleEmailEventEmitter implements EmailEventEmitter {
  emit(event: EmailEvent): void {
    console.log(
      JSON.stringify(
        {
          ...event,
          error: event.error
            ? {
                message: event.error?.message,
                provider: event.error?.provider,
                timestamp: event.timestamp.toISOString(),
              }
            : undefined,
          timestamp: event.timestamp.toISOString(),
        },
        null,
        2
      )
    );
  }
}

export class EmailMessageFactory {
  static createVerifyEmailMessage(
    toEmail: string,
    token: string,
    host: string
  ) {
    const data: EmailMessage = {
      to: [toEmail],
      from: "noreply@sandbox64940a76262d4b8d801bb0f6498a4dbd.mailgun.org",
      subject: "Verify your Fin account",
      html: `
        <h1>Welcome to Fin!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${host}/verify-email/${token}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
      body: `Welcome to Fin!\n\nPlease verify your email address by clicking the link below:\n\n${host}/verify-email/${token}\n\nThis link will expire in 24 hours.`,
    };

    return data;
  }

  static createPasswordResetEmailMessage(
    toEmail: string,
    token: string,
    host: string
  ) {
    const data: EmailMessage = {
      to: [toEmail],
      subject: "Reset your Fin password",
      from: "noreply@sandbox64940a76262d4b8d801bb0f6498a4dbd.mailgun.org",
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${host}/reset-password/${token}">Reset Password</a>
        <p>This link will expire in 24 hours.</p>
      `,
      body: `Password Reset Request\n\nClick the link below to reset your password:\n\n${host}/reset-password/${token}\n\nThis link will expire in 24 hours.`,
    };

    return data;
  }
}
