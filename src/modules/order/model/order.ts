import type { TBook } from "@/book/interface/book.js";
import {
  type TOrderDocument,
  type TOrderModel,
  type TOrderStatus,
  type TPaymentStatus,
} from "@/order/interface/order.js";
import { OrderStatus, PaymentStatus } from "@/order/validation/order.js";
import { Aggregate, model, Schema, Types, type PipelineStage } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderSchema = new Schema<TOrderDocument>(
  {
    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
    },
    price: {
      type: Number,
      required: true,
    },
    librarianEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    orderID: {
      type: String,
      unique: true,
      default: () => `BW${new Types.ObjectId().toString().slice(0, 10)}`,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: Object.values(OrderStatus) as [TOrderStatus, ...TOrderStatus[]],
      default: OrderStatus.PENDING,
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
  },
  {
    timestamps: true,
  },
);

orderSchema.statics.getOrdersByEmail = function (
  email: string,
): Aggregate<TOrderDocument & { orderedBook: TBook }[]> {
  try {
    const pipeline: PipelineStage[] = [
      {
        $match: { $or: [{ customerEmail: email }, { librarianEmail: email }] },
      },
      {
        $addFields: {
          objectId: { $toObjectId: "$bookId" },
        },
      },
      {
        $lookup: {
          from: "books",
          localField: "objectId",
          foreignField: "_id",
          as: "orderedBook",
        },
      },
      {
        $unwind: "$orderedBook",
      },
      {
        $project: {
          objectId: 0,
          "orderedBook._id": 0,
          "orderedBook.updatedAt": 0,
          "orderedBook.status": 0,
          "orderedBook.pageCount": 0,
          __v: 0,
        },
      },
    ];

    return this.aggregate(pipeline) as Aggregate<
      TOrderDocument & { orderedBook: TBook }[]
    >;
  } catch (error) {
    throw error;
  }
};

orderSchema.statics.isOrdered = async function (
  bookId: string,
  customerEmail: string,
) {
  try {
    const order: TOrderDocument | null = await this.findOne({
      bookId,
      customerEmail,
    });

    if (!order) return false;

    switch (order.status) {
      case OrderStatus.PENDING:
      case OrderStatus.SHIPPED:
      case OrderStatus.DELIVERED:
        return true;
      case OrderStatus.CANCELLED:
        return false;
      default:
        return false;
    }
  } catch (error) {
    throw error;
  }
};

orderSchema.plugin(mongooseAggregatePaginate);

export const Order = model<TOrderDocument, TOrderModel>("Order", orderSchema);
