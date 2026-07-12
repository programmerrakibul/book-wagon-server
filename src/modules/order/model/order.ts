import type { TBook } from "@/book/interface/book.js";
import { type TOrder, type TOrderModel } from "@/order/interface/order.js";
import {
  OrderStatus,
  PaymentStatus,
  type TOrderStatus,
  type TPaymentStatus,
} from "@/order/validation/order.js";
import { Aggregate, model, Schema, Types, type PipelineStage } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const orderSchema = new Schema<TOrder>(
  {
    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
      index: true,
    },

    customerId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
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
    },
  },

  {
    timestamps: true,
    collection: "Order",
    versionKey: false,
  },
);

orderSchema.statics.getOrdersByEmail = function (
  email: string,
): Aggregate<TOrder & { orderedBook: TBook }[]> {
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
      TOrder & { orderedBook: TBook }[]
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
    const order: TOrder | null = await this.findOne({
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

export const Order = model<TOrder, TOrderModel>("Order", orderSchema);
