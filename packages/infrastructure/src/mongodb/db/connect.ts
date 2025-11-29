import { connectMongoose } from "./client";

/**
 * Module-level singleton flag tracking whether a database connection has been
 * established. This module implements a simple singleton pattern: the
 * `isConnected` boolean ensures that the connection initialization (and any
 * side-effects) performed by `ensureDbConnection` only occur once for the
 * lifetime of the Node process. Calling `ensureDbConnection` multiple times
 * from different modules will not trigger multiple connection attempts.
 *
 * @private
 * @type {boolean}
 */
let isConnected = false;

/**
 * Ensure a Mongoose connection is established.
 *
 * This function is idempotent and safe to call multiple times. On the first
 * invocation it will call `connectMongoose()` and set the module-level
 * `isConnected` flag. Subsequent calls will return immediately because the
 * singleton flag indicates the connection has already been created.
 *
 * @async
 * @returns {Promise<void>} Resolves once the database connection is ready or
 *   immediately if it has already been established.
 * @example
 * await ensureDbConnection();
 */
export async function ensureDbConnection() {
  if (isConnected) {
    return;
  }

  await connectMongoose();
  isConnected = true;
}
