import mongoose, { Model } from "mongoose";

/**
 * Persistence interface representing how a PaymentSource is stored in MongoDB.
 * This interface mirrors the Mongoose document shape and is used by the
 * infrastructure mappers/repositories. Note: this is a persistence-level
 * representation and differs from the domain `PaymentSource` entity; use the
 * corresponding mapper to convert between them.
 */
export interface IPaymentSource extends Document {
  _id: string;
  name: string;
  type: string;
  details: string;
  createdAt: Date;
}

/**
 * Mongoose schema for the PaymentSource collection. The schema defines the
 * persisted field names, types and constraints (e.g. required fields and
 * enum values). When changing the schema, ensure any mappers and domain
 * rehydration logic are updated accordingly.
 */
const PaymentSourceSchema = new mongoose.Schema<IPaymentSource>({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: [
      "BANK_ACCOUNT",
      "DEBIT_CARD",
      "CREDIT_CARD",
      "VENMO",
      "PAYPAL",
      "CASH",
      "OTHER",
    ],
    required: true,
  },
  details: String,
  createdAt: { type: Date, default: Date.now },
});

/**
 * Mongoose model for PaymentSource.
 *
 * The export returns an existing registered model when present (useful for
 * environments supporting hot-reload) or registers a new model from the
 * schema. Use this model only within the infrastructure layer.
 */
export const PaymentSourceModel: Model<IPaymentSource> =
  (mongoose.models.PaymentSource as Model<IPaymentSource>) ||
  mongoose.model<IPaymentSource>("PaymentSource", PaymentSourceSchema);
