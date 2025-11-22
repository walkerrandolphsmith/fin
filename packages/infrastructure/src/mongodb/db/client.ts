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

export async function disconnectMongoose() {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = undefined;
    cached.promise = undefined;
    global._mongoose = undefined;
  }
}
