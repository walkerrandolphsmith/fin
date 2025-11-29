import { IUnitOfWork } from "@fin/domain";
import mongoose from "mongoose";
import { asyncLocalStorage } from "./asyncLocalStorage";

/**
 * Implementation of the Unit of Work pattern using Mongoose transactions.
 *
 * This class encapsulates transactional boundaries so callers can provide a
 * callback containing repository operations that should be executed atomically.
 * The UnitOfWork is responsible for starting a ClientSession, executing the
 * provided work inside a transaction (using `withTransaction`), and ensuring
 * the session is ended when finished.
 *
 * The implementation also uses `asyncLocalStorage` to store the active
 * session for the duration of the transaction, allowing repository methods
 * to automatically participate in the same session without requiring the
 * session to be passed through every method call.
 */
export class UnitOfWork implements IUnitOfWork {
  /**
   * Execute asynchronous work inside a transaction boundary.
   *
   * Behavior:
   * - Starts a new Mongoose ClientSession.
   * - Runs the provided `work` callback inside `session.withTransaction`, which
   *   will commit or abort the transaction based on the callback's success or
   *   failure.
   * - Makes the session available to downstream code via
   *   `asyncLocalStorage.run({ session }, work)` so repositories can access
   *   the session implicitly for their operations.
   * - Ensures the session is always ended in a `finally` block.
   *
   * Notes:
   * - The return value of `work` is propagated to the caller.
   * - Any error thrown by `work` will cause the transaction to abort and the
   *   error to be rethrown to the caller.
   *
   * @template T
   * @param {() => Promise<T>} work - Async callback containing operations to run in the unit of work.
   * @returns {Promise<T>} Resolves with the value returned by `work` if the transaction commits.
   */
  async execute<T>(work: () => Promise<T>): Promise<T> {
    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(() =>
        asyncLocalStorage.run({ session }, work)
      );
    } finally {
      await session.endSession();
    }
  }
}
