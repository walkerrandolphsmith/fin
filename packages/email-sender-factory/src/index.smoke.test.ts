import {
  CostTier,
  EmailEvent,
  EmailEventEmitter,
  EmailEventType,
  EmailMessage,
} from "@fin/email-sender";
import { EmailSenderFactory, EmailSystemConfig } from ".";

let eventCollector: TestEventCollector;
let testConfig: EmailSystemConfig;
let testEmailMessage: EmailMessage;

beforeEach(() => {
  eventCollector = new TestEventCollector();
  testConfig = {
    providers: {
      mailgun: {
        apiKey: process.env.MAILGUN_API_KEY || "",
        domain: "sandbox64940a76262d4b8d801bb0f6498a4dbd.mailgun.org",
      },
    },
    baseUrl: "http://localhost:3000",
    circuitBreaker: {
      failureThreshold: 3,
      successThreshold: 2,
      cooldownMs: 5000, // 5 seconds for testing
      halfOpenMaxAttempts: 1,
    },
    costConfig: {
      allowedTiers: new Set([
        CostTier.FREE,
        CostTier.CHEAP,
        CostTier.PAID,
        CostTier.PREMIUM,
      ]),
      maxCostTier: CostTier.PREMIUM,
    },
    eventEmitter: eventCollector,
  };
  testEmailMessage = {
    from: "noreply@sandbox64940a76262d4b8d801bb0f6498a4dbd.mailgun.org",
    to: ["walkerrandolphsmith@gmail.com"],
    subject: "HTML Email Test",
    body: "Plain text fallback",
    html: `
          <!DOCTYPE html>
          <html>
            <head><title>Test Email</title></head>
            <body>
              <h1>Hello from the Email System</h1>
              <p>This is a <strong>rich HTML</strong> email.</p>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </body>
          </html>
        `,
  };
});

it("should send a plain text email successfully", async () => {
  const emailSender = EmailSenderFactory.create(testConfig);

  try {
    const result = await emailSender.send({
      ...testEmailMessage,
      html: undefined,
    });

    expect(result).toBeDefined();
    expect(result.messageId).toBeDefined();
    expect(typeof result.messageId).toBe("string");
    expect(result.provider).toBe("Mailgun");
    expect(result.timestamp).toBeInstanceOf(Date);

    expect(
      eventCollector.hasEvent(EmailEventType.PROVIDER_ATTEMPTED, "Mailgun")
    ).toBe(true);
    expect(
      eventCollector.hasEvent(EmailEventType.PROVIDER_SUCCEEDED, "Mailgun")
    ).toBe(true);

    const successEvents = eventCollector.getEventsByType(
      EmailEventType.PROVIDER_SUCCEEDED
    );
    expect(successEvents.length).toBeGreaterThan(0);
    expect(successEvents[0].result?.messageId).toBe(result.messageId);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}, 10000);

it("should send HTML email", async () => {
  const sender = EmailSenderFactory.create(testConfig);

  const result = await sender.send(testEmailMessage);

  expect(result).toBeDefined();
  expect(result.messageId).toBeDefined();
}, 10000);

it("should throw FatalEmailError for invalid email addresses", async () => {
  const sender = EmailSenderFactory.create(testConfig);

  const invalidEmail: EmailMessage = {
    ...testEmailMessage,
    to: ["not-an-email"],
  };

  await expect(sender.send(invalidEmail)).rejects.toThrow();

  const failureEvents = eventCollector.getEventsByType(
    EmailEventType.PROVIDER_FAILED
  );
  expect(failureEvents.length).toBeGreaterThan(0);
}, 10000);

class TestEventCollector implements EmailEventEmitter {
  public events: EmailEvent[] = [];

  emit(event: EmailEvent): void {
    this.events.push(event);
  }

  getEventsByType(type: EmailEventType): EmailEvent[] {
    return this.events.filter((e) => e.type === type);
  }

  clear(): void {
    this.events = [];
  }

  hasEvent(type: EmailEventType, provider?: string): boolean {
    return this.events.some(
      (e) => e.type === type && (!provider || e.provider === provider)
    );
  }
}
