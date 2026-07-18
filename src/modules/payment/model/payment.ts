import { PaymentStatus } from "@/order/validation/order.js";
import type { TPaymentDocument } from "@/payment/interface/payment.js";
import { Schema, Types, model, type PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const paymentSchema = new Schema<TPaymentDocument>(
  {
    orderID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      ref: "Order",
      index: true,
    },

    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },

    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
      index: true,
    },

    customer_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    paymentStatus: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.UNPAID,
      index: true,
    },

    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "Payment",
    versionKey: false,
  },
);

paymentSchema.plugin(paginate);

export const Payment = model<TPaymentDocument, PaginateModel<TPaymentDocument>>(
  "Payment",
  paymentSchema,
);
