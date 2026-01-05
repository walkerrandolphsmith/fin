import {
  ConsoleEmailEventEmitter,
  CostConfig,
  EmailEventEmitter,
  IEmailSender,
} from "@fin/email-sender";
import {
  CircuitBreaker,
  CircuitBreakerConfig,
} from "@fin/email-sender-circuit-breaker";
import { FailoverEmailSender } from "@fin/email-sender-failover";
import { MailgunEmailProvider } from "@fin/email-sender-mailgun";

export interface EmailSystemConfig {
  providers: {
    mailgun?: { apiKey: string; domain: string };
  };
  circuitBreaker?: Partial<CircuitBreakerConfig>;
  costConfig?: CostConfig;
  eventEmitter?: EmailEventEmitter;
  baseUrl: string;
}

export class EmailSenderFactory {
  static create(config: EmailSystemConfig): IEmailSender {
    const eventEmitter = config.eventEmitter || new ConsoleEmailEventEmitter();
    const providers: IEmailSender[] = [];

    const cbConfig: CircuitBreakerConfig = {
      failureThreshold: 3,
      successThreshold: 2,
      cooldownMs: 60000,
      halfOpenMaxAttempts: 1,
      ...config.circuitBreaker,
    };

    if (config.providers.mailgun) {
      const mg = new MailgunEmailProvider(
        config.providers.mailgun.apiKey,
        config.providers.mailgun.domain
      );
      providers.push(new CircuitBreaker(mg, cbConfig, eventEmitter));
    }

    return new FailoverEmailSender(
      providers,
      { costConfig: config.costConfig },
      eventEmitter
    );
  }
}
