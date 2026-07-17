import { type TOrder } from "@/order/interface/order.js";
import {
  OrderStatus,
  PaymentStatus,
  type TOrderStatus,
  type TPaymentStatus,
} from "@/order/validation/order.js";
import { double } from "@/utils/utils.js";
import { model, Schema, Types, type PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const schema = new Schema<TOrder>(
  {
    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
    },

    customerId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    librarianId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    price: {
      type: Number,
      required: true,
      set: (value: number) => double(value),
    },

    totalPrice: {
      type: Number,
      required: true,
      set: (value: number) => double(value),
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: Object.values(OrderStatus) as [TOrderStatus, ...TOrderStatus[]],
      default: OrderStatus.PENDING,
      index: true,
    },

    paymentStatus: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      enum: Object.values(PaymentStatus) as [
        TPaymentStatus,
        ...TPaymentStatus[],
      ],
      default: PaymentStatus.UNPAID,
      index: true,
    },
  },

  {
    timestamps: true,
    collection: "Order",
    versionKey: false,
  },
);

schema.plugin(paginate);

const Order = model<TOrder, PaginateModel<TOrder>>("Order", schema);
export default Order;
