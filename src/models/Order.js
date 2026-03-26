import mongoose from "mongoose";
import { nanoid } from "nanoid";

const orderSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Book ID is required"],
      ref: "Book",
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid Book ID format",
      },
    },
    librarianEmail: {
      type: String,
      required: [true, "Librarian email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      minlength: [3, "Customer name must be at least 3 characters long"],
      maxlength: [50, "Customer name cannot exceed 50 characters"],
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      trim: true,
      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: "Please provide a valid email address",
      },
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      minlength: [5, "Address must be at least 5 characters long"],
      maxlength: [100, "Address cannot exceed 100 characters"],
    },
    orderID: {
      type: String,
      unique: true,
      default: `BW-${nanoid().replace(/[-_]/g, "")}`,
    },
    status: {
      type: String,
      required: [true, "Order status is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: ["pending", "shipped", "delivered", "cancelled"],
        message:
          "{VALUE} is not a valid order status. Must be: pending, shipped, delivered, cancelled",
      },
      default: "pending",
    },
    paymentStatus: {
      type: String,
      required: [true, "Payment status is required"],
      trim: true,
      lowercase: true,
      enum: {
        values: ["paid", "unpaid", "failed", "refunded"],
        message:
          "{VALUE} is not a valid payment status. Must be: paid, unpaid, failed, refunded",
      },
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
