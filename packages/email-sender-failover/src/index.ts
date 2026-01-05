import {
  AllProvidersFailedError,
  CostConfig,
  CostTier,
  EmailError,
  EmailEvent,
  EmailEventEmitter,
  EmailEventType,
  EmailMessage,
  EmailSendResult,
  FatalEmailError,
  IEmailSender,
} from "@fin/email-sender";

import { CircuitBreaker } from "@fin/email-sender-circuit-breaker";

export interface FailoverConfig {
  costConfig?: CostConfig;
  stopOnFatal?: boolean; // Default: true
}

export class FailoverEmailSender implements IEmailSender {
  readonly name = "FailoverSender";
  readonly costTier = CostTier.FREE;

  constructor(
    private readonly providers: IEmailSender[],
    private readonly config: FailoverConfig = {},
    private readonly eventEmitter?: EmailEventEmitter
  ) {
    if (providers.length === 0) {
      throw new Error("At least one provider is required");
    }
  }

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const errors: EmailError[] = [];
    const allowedProviders = this.filterProvidersByCost();

    if (allowedProviders.length === 0) {
      throw new AllProvidersFailedError(
        "No providers available within cost constraints",
        []
      );
    }

    for (const provider of allowedProviders) {
      try {
        this.emitEvent({
          type: EmailEventType.PROVIDER_ATTEMPTED,
          timestamp: new Date(),
          provider: provider.name,
          message,
        });

        const result = await provider.send(message);

        this.emitEvent({
          type: EmailEventType.PROVIDER_SUCCEEDED,
          timestamp: new Date(),
          provider: provider.name,
          result,
        });

        return result;
      } catch (error) {
        const emailError = error as EmailError;
        errors.push(emailError);

        this.emitEvent({
          type: EmailEventType.PROVIDER_FAILED,
          timestamp: new Date(),
          provider: provider.name,
          error: emailError,
        });

        // Stop immediately on fatal errors
        if (emailError instanceof FatalEmailError) {
          if (this.config.stopOnFatal !== false) {
            throw new AllProvidersFailedError(
              `Fatal error from ${provider.name}: ${emailError.message}`,
              errors
            );
          }
        }

        // Try next provider
        if (allowedProviders.indexOf(provider) < allowedProviders.length - 1) {
          this.emitEvent({
            type: EmailEventType.FALLBACK_TRIGGERED,
            timestamp: new Date(),
            provider: provider.name,
            metadata: {
              error: emailError.message,
              nextProvider:
                allowedProviders[allowedProviders.indexOf(provider) + 1].name,
            },
          });
        }
      }
    }

    throw new AllProvidersFailedError(
      `All ${allowedProviders.length} providers failed`,
      errors
    );
  }

  private filterProvidersByCost(): IEmailSender[] {
    if (!this.config.costConfig) {
      return this.providers;
    }

    const { allowedTiers, maxCostTier } = this.config.costConfig;
    const tierOrder = [
      CostTier.FREE,
      CostTier.CHEAP,
      CostTier.PAID,
      CostTier.PREMIUM,
    ];

    return this.providers.filter((p) => {
      if (allowedTiers && !allowedTiers.has(p.costTier)) {
        return false;
      }
      if (maxCostTier) {
        const providerIndex = tierOrder.indexOf(p.costTier);
        const maxIndex = tierOrder.indexOf(maxCostTier);
        return providerIndex <= maxIndex;
      }
      return true;
    });
  }

  private emitEvent(event: EmailEvent): void {
    this.eventEmitter?.emit(event);
  }

  getProviderHealth(): Array<{ name: string; health: unknown }> {
    return this.providers.map((p) => ({
      name: p.name,
      health:
        p instanceof CircuitBreaker ? p.getHealthInfo() : { state: "unknown" },
    }));
  }
}
