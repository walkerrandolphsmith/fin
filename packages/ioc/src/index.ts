import {
  BillService,
  PaymentSourceService,
  UserService,
} from "@fin/application";
import { IExtractBillDetailsFromPrintableDocuments } from "@fin/bill-parser";
import { ClaudeBillParser } from "@fin/bill-parser-claude";
import { BillParserDecorator } from "@fin/bill-parser-decorator";
import { PdfTextBillParser } from "@fin/bill-parser-pdf-parse";
import { ConfigurationFactory } from "@fin/configuration-factory";
import {
  BillService as BillDomainService,
  IBillRepository,
  IPaymentSourceRepository,
  IUnitOfWork,
  PaymentSourceService as PaymentSourceDomainService,
} from "@fin/domain";
import {
  IUserRepository,
  IVerificationTokenRepository,
  UserService as UserDomainService,
} from "@fin/domain/server";
import { IEmailSender } from "@fin/email-sender";
import { EmailSenderFactory } from "@fin/email-sender-factory";
import { UnitOfWork } from "@fin/infrastructure";
import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";

/**
 * TOKENS - a registry of Symbol keys used for dependency injection registrations.
 * Each key represents either an interface token, a concrete implementation token,
 * or an application/domain service token. Use these symbols when registering
 * or resolving dependencies from the DI container to avoid magic strings.
 *
 * @constant {Object.<string, symbol>} TOKENS
 */
const TOKENS = {
  IBillRepository: Symbol.for("IBillRepository"),
  IPaymentSourceRepository: Symbol.for("IPaymentSourceRepository"),
  BillDomainService: Symbol.for("BillDomainService"),
  BillService: Symbol.for("BillService"),
  PaymentSourceDomainService: Symbol.for("PaymentSourceDomainService"),
  PaymentSourceService: Symbol.for("PaymentSourceService"),
  BillRepository: Symbol.for("BillRepository"),
  PaymentSourceRepository: Symbol.for("PaymentSourceRepository"),
  UnitOfWork: Symbol.for("UnitOfWork"),
  BillParser: Symbol.for("BillParser"),
  IUserRepository: Symbol.for("IUserRepository"),
  IVerificationTokenRepository: Symbol.for("IVerificationTokenRepository"),
  UserDomainService: Symbol.for("UserDomainService"),
  UserService: Symbol.for("UserService"),
  IEmailSender: Symbol.for("IEmailSender"),
  UserRepository: Symbol.for("UserRepository"),
  VerificationTokenRepository: Symbol.for("VerificationTokenRepository"),
  MailgunEmailService: Symbol.for("MailgunEmailService"),
};

/**
 * Set up and configure the tsyringe DependencyContainer for the application.
 *
 * Responsibilities:
 * - Dynamically import persistence implementations (repositories and DB connector).
 * - Register concrete repository classes under both concrete and interface tokens.
 * - Register domain services and application services using factory providers
 *   so their runtime dependencies are resolved from the container.
 * - Register UnitOfWork and a BillParser decorator that composes multiple
 *   parser implementations.
 * - Initiate and await the database connection before returning the container.
 *
 * Side effects:
 * - Initiates a mongoose (or other) connection via the infrastructure layer.
 * - Mutates the shared `container` from tsyringe by registering tokens.
 *
 * @async
 * @function setupContainer
 * @returns {Promise<DependencyContainer>} Resolves with the configured
 *   tsyringe DependencyContainer once the DB connection is established and
 *   registrations are complete.
 * @throws {Error} If dynamic imports, registrations, or the DB connection fail.
 * @example
 * await setupContainer();
 * const c = container; // configured tsyringe container
 */
async function setupContainer(): Promise<DependencyContainer> {
  const configuration = ConfigurationFactory.create();
  const {
    BillRepository,
    PaymentSourceRepository,
    UserRepository,
    VerificationTokenRepository,
    connectMongoose,
  } = await import("@fin/infrastructure");

  const promise = connectMongoose();

  container.register(TOKENS.UserRepository, {
    useClass: UserRepository,
  });

  container.register(TOKENS.VerificationTokenRepository, {
    useClass: VerificationTokenRepository,
  });

  container.register(TOKENS.IUserRepository, {
    useToken: TOKENS.UserRepository,
  });

  container.register(TOKENS.IVerificationTokenRepository, {
    useToken: TOKENS.VerificationTokenRepository,
  });

  container.register(TOKENS.IEmailSender, {
    useFactory: () => {
      const emailSystemConfig = {
        providers: {
          mailgun: {
            apiKey: configuration.mailgunApiKey,
            domain: configuration.mailgunDomain,
          },
        },
        baseUrl: configuration.baseUrl,
      };
      console.log("Creating EmailSender with config:", emailSystemConfig);
      return EmailSenderFactory.create(emailSystemConfig);
    },
  });

  container.register(TOKENS.UserDomainService, {
    useFactory: (c) => {
      const userRepository = c.resolve<IUserRepository>(
        TOKENS.IUserRepository
      );
      const verificationTokenRepository =
        c.resolve<IVerificationTokenRepository>(
          TOKENS.IVerificationTokenRepository
        );
      const unitOfWork = c.resolve<IUnitOfWork>(TOKENS.UnitOfWork);
      return new UserDomainService(
        userRepository,
        verificationTokenRepository,
        unitOfWork
      );
    },
  });

  container.register(TOKENS.UserService, {
    useFactory: (c) => {
      const domainService = c.resolve<UserDomainService>(
        TOKENS.UserDomainService
      );
      const emailService = c.resolve<IEmailSender>(TOKENS.IEmailSender);
      return new UserService(domainService, emailService);
    },
  });

  container.register(TOKENS.BillRepository, {
    useClass: BillRepository,
  });

  container.register(TOKENS.PaymentSourceRepository, {
    useClass: PaymentSourceRepository,
  });

  container.register(TOKENS.IBillRepository, {
    useClass: BillRepository,
  });

  container.register(TOKENS.IPaymentSourceRepository, {
    useClass: PaymentSourceRepository,
  });

  container.register(TOKENS.BillDomainService, {
    useFactory: (c) => {
      const repo = c.resolve<IBillRepository>(TOKENS.IBillRepository);
      return new BillDomainService(repo);
    },
  });

  container.register(TOKENS.PaymentSourceDomainService, {
    useFactory: (c) => {
      const repo = c.resolve<IPaymentSourceRepository>(
        TOKENS.IPaymentSourceRepository
      );
      const billRepo = c.resolve<IBillRepository>(TOKENS.IBillRepository);
      const unitOfWork = c.resolve<IUnitOfWork>(TOKENS.UnitOfWork);
      return new PaymentSourceDomainService(repo, billRepo, unitOfWork);
    },
  });

  container.register(TOKENS.BillService, {
    useFactory: (c) => {
      const domainService = c.resolve<BillDomainService>(
        TOKENS.BillDomainService
      );
      const parser = c.resolve<IExtractBillDetailsFromPrintableDocuments>(
        TOKENS.BillParser
      );
      return new BillService(domainService, parser);
    },
  });

  container.register(TOKENS.PaymentSourceService, {
    useFactory: (c) => {
      const domainService = c.resolve<PaymentSourceDomainService>(
        TOKENS.PaymentSourceDomainService
      );
      return new PaymentSourceService(domainService);
    },
  });

  container.register(TOKENS.UnitOfWork, {
    useClass: UnitOfWork,
  });

  container.register(TOKENS.BillParser, {
    useFactory: (c) => {
      return new BillParserDecorator([
        new PdfTextBillParser(),
        new ClaudeBillParser(configuration.anthropicApiKey),
      ]);
    },
  });

  await promise;

  return container;
}

let initialized = false;

/**
 * Return the singleton tsyringe container for the application.
 *
 * This function ensures setupContainer() is executed only once. On the first
 * invocation it will initialise and configure the container; subsequent calls
 * return the already-initialized container immediately.
 *
 * @async
 * @function getContainer
 * @returns {Promise<DependencyContainer>} Promise resolving to the initialized
 *   DependencyContainer singleton.
 * @example
 * const c = await getContainer();
 */
async function getContainer() {
  if (!initialized) {
    await setupContainer();
    initialized = true;
  }
  return container;
}

export { container, getContainer, setupContainer, TOKENS };
