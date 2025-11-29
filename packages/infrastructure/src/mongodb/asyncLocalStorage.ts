import { AsyncLocalStorage } from "async_hooks";
import { ClientSession } from "mongoose";

/**
 * TransactionContext stored in AsyncLocalStorage. Contains the active
 * Mongoose ClientSession for request-scoped transactional operations.
 */
export interface TransactionContext {
  session: ClientSession;
}

/**
 * AsyncLocalStorage instance used to store per-request transaction context
 * (ClientSession) so that repository implementations can participate in a
 * UnitOfWork/transaction boundary without threading session objects through
 * every call site.
 */
const asyncLocalStorage = new AsyncLocalStorage<TransactionContext>();

export { asyncLocalStorage };
