import {
  CostTier,
  EmailEvent,
  EmailEventEmitter,
  EmailEventType,
  EmailMessage,
  EmailSendResult,
  FatalEmailError,
  IEmailSender,
  RetryableEmailError,
} from "@fin/email-sender";
import { EmailSenderFactory, EmailSystemConfig } from ".";

jest.mock("@fin/email-sender-mailgun", () => ({
  MailgunEmailProvider: jest
    .fn()
    .mockImplementation(() => new MockMailgunProvider()),
}));

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
    to: ["invalid@@@email"],
  };

  await expect(sender.send(invalidEmail)).rejects.toThrow();

  const failureEvents = eventCollector.getEventsByType(
    EmailEventType.PROVIDER_FAILED
  );
  expect(failureEvents.length).toBeGreaterThan(0);
}, 10000);

it("should open circuit after threshold failures", async () => {
  const sender = EmailSenderFactory.create({
    ...testConfig,
    circuitBreaker: {
      failureThreshold: 2,
      successThreshold: 2,
      cooldownMs: 5000,
      halfOpenMaxAttempts: 1,
    },
  });

  const invalidEmail: EmailMessage = {
    ...testEmailMessage,
    to: ["retry@example.com"],
  };

  // Attempt to send multiple times to trigger circuit breaker
  for (let i = 0; i < 3; i++) {
    try {
      await sender.send(invalidEmail);
    } catch (error) {
      // Expected to fail
    }
  }

  const circuitOpenEvents = eventCollector.getEventsByType(
    EmailEventType.CIRCUIT_OPENED
  );
  expect(circuitOpenEvents.length).toBeGreaterThan(0);
}, 15000);

it("should close circuit after successful attempts in half-open state", async () => {
  const cooldownMs = 2000;
  const sender = EmailSenderFactory.create({
    ...testConfig,
    circuitBreaker: {
      failureThreshold: 2,
      successThreshold: 2,
      cooldownMs,
      halfOpenMaxAttempts: 3,
    },
  });

  // First, trigger circuit to open
  const invalidEmail: EmailMessage = {
    ...testEmailMessage,
    to: ["retry@example.com"],
  };

  for (let i = 0; i < 3; i++) {
    try {
      await sender.send(invalidEmail);
    } catch (error) {
      // Expected
    }
  }

  // Wait for cooldown
  await new Promise((resolve) => setTimeout(resolve, cooldownMs + 500));

  // Send valid emails to close circuit
  for (let i = 0; i < 3; i++) {
    try {
      await sender.send(testEmailMessage);
    } catch (error) {
      // May fail if circuit is still open
    }
  }

  // Check events
  const halfOpenEvents = eventCollector.getEventsByType(
    EmailEventType.CIRCUIT_HALF_OPEN
  );
  const closedEvents = eventCollector.getEventsByType(
    EmailEventType.CIRCUIT_CLOSED
  );
  expect(halfOpenEvents.length).toBeGreaterThan(0);
  expect(closedEvents.length).toBeGreaterThan(0);
}, 20000);

it("should emit all expected events for successful send", async () => {
  const sender = EmailSenderFactory.create(testConfig);

  await sender.send(testEmailMessage);

  // Check for expected events
  expect(eventCollector.hasEvent(EmailEventType.PROVIDER_ATTEMPTED)).toBe(
    true
  );
  expect(eventCollector.hasEvent(EmailEventType.PROVIDER_SUCCEEDED)).toBe(
    true
  );

  // Verify event timestamps are recent
  const events = eventCollector.events;
  const now = Date.now();
  events.forEach((event) => {
    const eventTime = event.timestamp.getTime();
    expect(now - eventTime).toBeLessThan(10000); // Within 10 seconds
  });
}, 10000);

it("should emit failure events with error details", async () => {
  const sender = EmailSenderFactory.create(testConfig);

  const invalidEmail: EmailMessage = {
    ...testEmailMessage,
    to: ["bad-email@@@"],
  };

  try {
    await sender.send(invalidEmail);
  } catch (error) {
    // Expected
  }

  const failureEvents = eventCollector.getEventsByType(
    EmailEventType.PROVIDER_FAILED
  );
  expect(failureEvents.length).toBeGreaterThan(0);

  const firstFailure = failureEvents[0];
  expect(firstFailure.error).toBeDefined();
  expect(firstFailure.error?.provider).toBe("Mailgun");
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

class MockMailgunProvider implements IEmailSender {
  readonly name = "Mailgun";
  readonly costTier = CostTier.PAID;

  private shouldSimulateFailure = false;
  private failureMode: "rate-limit" | "invalid-email" | "network" =
    "rate-limit";

  async send(message: EmailMessage): Promise<EmailSendResult> {
    // Simulate some processing delay
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Simulate validation errors
    if (
      message.to.some((email) => !email.includes("@") || email.includes("@@@"))
    ) {
      throw new FatalEmailError("Invalid email address format", this.name);
    }

    if (message.to.some((email) => email.endsWith("retry@example.com"))) {
      throw new RetryableEmailError(
        "Simulated retryable error",
        this.name,
        1000
      );
    }

    if (!message.from || !message.to || message.to.length === 0) {
      throw new FatalEmailError("Missing required fields", this.name);
    }

    // Simulate various failure modes for testing
    if (this.shouldSimulateFailure) {
      switch (this.failureMode) {
        case "rate-limit":
          throw new RetryableEmailError(
            "Rate limit exceeded",
            this.name,
            30000
          );
        case "invalid-email":
          throw new FatalEmailError("Invalid email address", this.name);
        case "network":
          throw new RetryableEmailError("Network timeout", this.name);
      }
    }

    return {
      messageId: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      provider: this.name,
      timestamp: new Date(),
    };
  }

  // Test helper methods
  simulateFailure(mode: "rate-limit" | "invalid-email" | "network") {
    this.shouldSimulateFailure = true;
    this.failureMode = mode;
  }

  resetFailureSimulation() {
    this.shouldSimulateFailure = false;
  }
}
