import { BillService, PaymentSourceService } from "@fin/application";
import { IExtractBillDetailsFromPrintableDocuments } from "@fin/bill-parser";
import { ClaudeBillParser } from "@fin/bill-parser-claude";
import { BillParserDecorator } from "@fin/bill-parser-decorator";
import { PdfTextBillParser } from "@fin/bill-parser-pdf-parse";
import {
  BillService as BillDomainService,
  IBillRepository,
  IPaymentSourceRepository,
  IUnitOfWork,
  PaymentSourceService as PaymentSourceDomainService,
} from "@fin/domain";
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
  const { BillRepository, PaymentSourceRepository, connectMongoose } =
    await import("@fin/infrastructure");

  const promise = connectMongoose();

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
        new ClaudeBillParser(),
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
