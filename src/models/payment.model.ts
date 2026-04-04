import { Types, Schema, model } from "mongoose";
import { PaymentStatus } from "../validators/order.validator.js";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

import type { TPaymentStatus } from "../types/order.interface.js";
import type {
  TPaymentDocument,
  TPaymentModel,
} from "../types/payment.interface.js";

const paymentSchema = new Schema<TPaymentDocument>(
  {
    orderID: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      ref: "Order",
    },
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
    },
    customer_email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    paymentStatus: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: Object.values(PaymentStatus) as [
        TPaymentStatus,
        ...TPaymentStatus[],
      ],
      default: PaymentStatus.UNPAID,
    },
    price: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.plugin(mongooseAggregatePaginate);

export const Payment = model<TPaymentDocument, TPaymentModel>(
  "Payment",
  paymentSchema,
);
