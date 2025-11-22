import mongoose, { Model } from "mongoose";

export interface IPaymentSource extends Document {
  _id: string;
  name: string;
  type: string;
  details: string;
  createdAt: Date;
}

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

export const PaymentSourceModel: Model<IPaymentSource> =
  (mongoose.models.PaymentSource as Model<IPaymentSource>) ||
  mongoose.model<IPaymentSource>("PaymentSource", PaymentSourceSchema);
