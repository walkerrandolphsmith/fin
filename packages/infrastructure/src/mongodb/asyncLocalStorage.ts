import { AsyncLocalStorage } from "async_hooks";
import { ClientSession } from "mongoose";

export interface TransactionContext {
  session: ClientSession;
}

const asyncLocalStorage = new AsyncLocalStorage<TransactionContext>();

export { asyncLocalStorage };
