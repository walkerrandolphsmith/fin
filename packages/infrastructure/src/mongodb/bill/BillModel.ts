import mongoose, { Document, Model, Schema, Types } from "mongoose";

/**
 * Mongoose persistence model interface representing how a Bill is stored in
 * MongoDB. This interface is used by the infrastructure layer and mirrors the
 * persisted document shape (types use Mongoose/Node types such as
 * `Types.ObjectId`).
 *
 * Note: This is not the domain model. Use `BillPersistenceMapper` to convert
 * between this persistence representation and the domain `Bill` entity.
 */
export interface IBillModel extends Document<Types.ObjectId> {
  _id: Types.ObjectId;
  name: string;
  amount: number;
  dueDate?: Date;
  createdAt: Date;
  order: number;
  paymentSourceId?: Types.ObjectId | null;
  isReoccurring: boolean;
  paymentPortal: {
    type: "url" | "appIntent";
    value: string;
    metadata?: Record<string, unknown>;
  };
  hasFixedAmount: boolean;
}

/**
 * Mongoose schema for the `Bill` collection. The schema defines the persisted
 * field names and types used by Mongoose and should remain aligned with the
 * `IBillModel` interface.
 *
 * When modifying the schema, ensure the `BillPersistenceMapper` and domain
 * rehydration logic are updated accordingly.
 */
const BillSchema = new mongoose.Schema<IBillModel>({
  name: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 },
  paymentSourceId: {
    type: Schema.Types.ObjectId,
    ref: "PaymentSource",
    required: false,
  },
  isReoccurring: { type: Boolean, default: true, required: true },
  paymentPortal: {
    type: {
      type: String,
      enum: ["url", "appIntent"],
      required: false,
    },
    value: { type: String, required: false },
    metadata: { type: Schema.Types.Mixed, required: false },
  },
  hasFixedAmount: { type: Boolean, default: true, required: false },
});

/**
 * Mongoose model for bills. This export returns the existing registered model
 * when available (to support hot-reload in some environments) or creates a
 * new model from the schema.
 *
 * Use `BillModel` exclusively in the infrastructure layer; domain code should
 * not import Mongoose models directly.
 */
export const BillModel: Model<IBillModel> =
  (mongoose.models.Bill as Model<IBillModel>) ||
  mongoose.model<IBillModel>("Bill", BillSchema);
