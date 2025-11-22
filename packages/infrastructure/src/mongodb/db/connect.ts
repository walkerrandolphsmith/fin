import { connectMongoose } from "./client";

let isConnected = false;

export async function ensureDbConnection() {
  if (isConnected) {
    return;
  }

  await connectMongoose();
  isConnected = true;
}
