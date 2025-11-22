import mongoose, { Document, Model, Schema, Types } from "mongoose";

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
}

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
});

export const BillModel: Model<IBillModel> =
  (mongoose.models.Bill as Model<IBillModel>) ||
  mongoose.model<IBillModel>("Bill", BillSchema);
