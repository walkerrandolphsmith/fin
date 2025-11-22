import "reflect-metadata";
import { container, DependencyContainer } from "tsyringe";

import { BillService, PaymentSourceService } from "@fin/application";
import { BillParserDecorator, IParseBillDocument } from "@fin/bill-parser";
import { DefaultBillParser } from "@fin/bill-parser-pdf-parse";
import {
  BillService as BillDomainService,
  IBillRepository,
  IPaymentSourceRepository,
  IUnitOfWork,
  PaymentSourceService as PaymentSourceDomainService,
} from "@fin/domain";
import { UnitOfWork } from "@fin/infrastructure";

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
      const parser = c.resolve<IParseBillDocument>(TOKENS.BillParser);
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
      return new BillParserDecorator([new DefaultBillParser()]);
    },
  });

  await promise;

  return container;
}

let initialized = false;

async function getContainer() {
  if (!initialized) {
    await setupContainer();
    initialized = true;
  }
  return container;
}

export { container, getContainer, setupContainer, TOKENS };
