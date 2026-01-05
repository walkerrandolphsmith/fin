import {
  CostTier,
  EmailError,
  EmailEventEmitter,
  EmailEventType,
  EmailMessage,
  EmailSendResult,
  IEmailSender,
  RetryableEmailError,
} from "@fin/email-sender";

export enum CircuitState {
  CLOSED = "closed", // Normal operation
  OPEN = "open", // Failing, blocking requests
  HALF_OPEN = "half_open", // Testing if recovered
}

export interface CircuitBreakerConfig {
  failureThreshold: number; // Failures before opening
  successThreshold: number; // Successes to close from half-open
  cooldownMs: number; // Time before trying again
  halfOpenMaxAttempts: number; // Max attempts in half-open state
}

export class CircuitBreaker implements IEmailSender {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private lastFailureTime?: Date;
  private halfOpenAttempts = 0;

  constructor(
    private readonly wrapped: IEmailSender,
    private readonly config: CircuitBreakerConfig,
    private readonly eventEmitter?: EmailEventEmitter
  ) {}

  get name(): string {
    return this.wrapped.name;
  }

  get costTier(): CostTier {
    return this.wrapped.costTier;
  }

  getState(): CircuitState {
    return this.state;
  }

  getHealthInfo() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailureTime: this.lastFailureTime,
      provider: this.name,
    };
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.updateState();

    if (this.state === CircuitState.OPEN) {
      throw new RetryableEmailError(
        `Circuit breaker is OPEN for ${this.name}`,
        this.name,
        this.getRemainingCooldownMs()
      );
    }

    try {
      const result = await this.wrapped.send(message);
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure(error as EmailError);
      throw error;
    }
  }

  private updateState(): void {
    if (this.state === CircuitState.OPEN && this.lastFailureTime) {
      const elapsed = Date.now() - this.lastFailureTime.getTime();
      if (elapsed >= this.config.cooldownMs) {
        this.transitionTo(CircuitState.HALF_OPEN);
        this.halfOpenAttempts = 0;
      }
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.failureCount = 0;
        this.successCount = 0;
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount = 0;
    }
  }

  private onFailure(error: EmailError): void {
    if (!(error instanceof RetryableEmailError)) {
      return;
    }

    this.lastFailureTime = new Date();

    if (this.state === CircuitState.HALF_OPEN) {
      this.halfOpenAttempts++;
      if (this.halfOpenAttempts >= this.config.halfOpenMaxAttempts) {
        this.transitionTo(CircuitState.OPEN);
      }
    } else if (this.state === CircuitState.CLOSED) {
      this.failureCount++;
      if (this.failureCount >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;

    if (this.eventEmitter) {
      const eventType =
        newState === CircuitState.OPEN
          ? EmailEventType.CIRCUIT_OPENED
          : newState === CircuitState.CLOSED
            ? EmailEventType.CIRCUIT_CLOSED
            : EmailEventType.CIRCUIT_HALF_OPEN;

      this.eventEmitter.emit({
        type: eventType,
        timestamp: new Date(),
        provider: this.name,
        metadata: { oldState, newState },
      });
    }
  }

  private getRemainingCooldownMs(): number | undefined {
    if (!this.lastFailureTime) return undefined;
    const elapsed = Date.now() - this.lastFailureTime.getTime();
    return Math.max(0, this.config.cooldownMs - elapsed);
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = undefined;
    this.halfOpenAttempts = 0;
  }
}
