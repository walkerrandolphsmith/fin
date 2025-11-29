/**
 * Domain package barrel file
 *
 * This module re-exports the domain layer's public types, entities, value
 * objects, errors, specifications, repositories and services. Importing from
 * this single barrel (e.g. `import { Bill, BillService } from '@fin/domain'`)
 * provides a convenient and stable surface area for consumers while allowing
 * internal file organization to change.
 *
 * Guidelines:
 * - Keep exported symbols minimal and stable to avoid breaking consumers.
 * - Prefer re-exporting types and classes that are part of the public API.
 * - Avoid exporting private helpers or implementation details from the
 *   barrel file.
 *
 * Example:
 *   import { Bill, Money, BillService } from '@fin/domain';
 */

export * from "./bill/entities/Bill";
export * from "./bill/errors/BillAmountCannotExceedThreshold";
export * from "./bill/errors/BillAmountMustBePositive";
export * from "./bill/repositories/IBillRepository";
export * from "./bill/services/BillService";
export * from "./bill/specifications/BillDueInNWeeksSpecificationBase";
export * from "./bill/specifications/BillDueNextWeekSpecification";
export * from "./bill/specifications/BillDueThisWeekSpecification";
export * from "./bill/value-objects/BillName";
export * from "./bill/value-objects/Money";
export * from "./bill/value-objects/PaymentPortal";
export * from "./bill/value-objects/Relation";
export * from "./common/errors/EntityMustHaveNameError";
export * from "./common/errors/EntityNotFoundError";
export * from "./common/errors/InvalidEntityIdError";
export * from "./common/errors/InvalidPropertiesError";
export * from "./common/ISpecification";
export * from "./common/IUnitOfWork";
export * from "./paymentSource/entities/PaymentSource";
export * from "./paymentSource/errors/PaymentSourceTypeUnknown";
export * from "./paymentSource/repositories/IPaymentSourceRepository";
export * from "./paymentSource/services/PaymentSourceService";
export * from "./paymentSource/value-objects/PaymentSourceName";
export * from "./paymentSource/value-objects/PaymentSourceType";
