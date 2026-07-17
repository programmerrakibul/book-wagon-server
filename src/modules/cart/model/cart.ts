import type { TCartDocument } from "@/cart/interface/cart.js";
import { model, Schema, Types } from "mongoose";

const cartSchema = new Schema<TCartDocument>(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
      unique: true,
      index: true,
    },

    items: [
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
          min: 1,
          default: 1,
        },

        addedAt: {
          type: Date,
          default: () => new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "Cart",
    versionKey: false,
  },
);

export const Cart = model<TCartDocument>("Cart", cartSchema);
