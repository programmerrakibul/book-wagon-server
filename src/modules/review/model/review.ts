import type { TReviewDocument } from "@/review/interface/review.js";
import { model, Schema, Types } from "mongoose";

const reviewSchema = new Schema<TReviewDocument>(
  {
    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
      unique: true,
      index: true,
    },

    reviews: [
      {
        customerEmail: {
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

        customerImage: {
          type: String,
          required: true,
          trim: true,
          lowercase: true,
        },

        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5,
        },

        review: {
          type: String,
          required: true,
          trim: true,
        },

        createdAt: {
          type: Date,
          default: () => new Date(),
        },

        updatedAt: {
          type: Date,
          default: () => new Date(),
        },
      },
    ],
  },
  {
    timestamps: true,
    collection: "Review",
    versionKey: false,
  },
);

export const Review = model<TReviewDocument>("Review", reviewSchema);
