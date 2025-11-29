import mongoose from "mongoose";

const { ConnectionStates } = mongoose;

declare global {
  var _mongoose:
    | { conn?: typeof mongoose; promise?: Promise<typeof mongoose> }
    | undefined;
}

const cached: {
  conn?: typeof mongoose | undefined;
  promise?: Promise<typeof mongoose>;
} = {
  conn: global._mongoose?.conn,
  promise: global._mongoose?.promise,
};

/**
 * Establish and cache a Mongoose connection using the `MONGODB_URI`
 * environment variable. If a connection is already cached, the cached
 * instance is returned immediately. The function stores both the active
 * connection and the pending connection promise to avoid concurrent
 * connection attempts.
 *
 * @async
 * @returns {Promise<typeof mongoose>} Resolves with the connected Mongoose instance.
 * @throws {Error} When MONGODB_URI is not defined.
 * @example
 * await connectMongoose();
 */
export async function connectMongoose() {
  const MONGODB_URI = process.env.MONGODB_URI || "";

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local"
    );
  }
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };
    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => mongooseInstance);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Perform a lightweight health check against the configured MongoDB
 * connection. The function ensures the connection is established, the
 * underlying DB object is available and issues an administrative ping.
 *
 * @async
 * @returns {Promise<boolean>} True when the database responds to a ping,
 *   otherwise false. Errors are logged to the console and false is returned.
 */
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const mongooseInstance = await connectMongoose();
    if (
      mongooseInstance.connection.readyState !== ConnectionStates.connected
    ) {
      return false;
    }
    if (!mongooseInstance.connection.db) {
      throw new Error();
    }
    await mongooseInstance.connection.db.admin().ping();
    return true;
  } catch (err) {
    console.error("Database health check failed:", err);
    return false;
  }
}

/**
 * Disconnect the cached Mongoose connection and clear cached state. Useful
 * for tearing down resources in tests or during graceful shutdown.
 *
 * @async
 * @returns {Promise<void>} Resolves once the Mongoose client is disconnected
 *   and module-level cache entries are cleared.
 */
export async function disconnectMongoose() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = undefined;
    cached.promise = undefined;
    global._mongoose = undefined;
  }
}
