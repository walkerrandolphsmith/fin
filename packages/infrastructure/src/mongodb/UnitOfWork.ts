import { IUnitOfWork } from "@fin/domain";
import mongoose from "mongoose";
import { asyncLocalStorage } from "./asyncLocalStorage";

export class UnitOfWork implements IUnitOfWork {
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
