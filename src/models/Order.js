import mongoose from "mongoose";
import { nanoid } from "nanoid";

const orderSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Book",
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
      default: `BW-${nanoid().replace(/[-_]/g, "")}`,
    },
    status: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      enum: ["paid", "unpaid", "failed", "refunded"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.statics.getOrdersByEmail = async function (email) {
  try {
    const pipeline = [
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
        },
      },
    ];

    return await this.aggregate(pipeline);
  } catch (error) {
    throw error;
  }
};

orderSchema.statics.isOrdered = async function (bookId, customerEmail) {
  try {
    const result = await this.findOne({ bookId, customerEmail });

    switch (result?.status) {
      case "pending":
      case "shipped":
      case "delivered":
        return true;
      case "cancelled":
        return false;
      default:
        return false;
    }
  } catch (error) {
    throw error;
  }
};

export const Order = mongoose.model("Order", orderSchema);
