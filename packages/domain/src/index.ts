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

export * from "./bill";
export * from "./common";
export * from "./paymentSource";
