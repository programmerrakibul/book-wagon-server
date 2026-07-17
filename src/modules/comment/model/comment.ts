import type { TCommentDocument } from "@/comment/interface/comment.js";
import { model, Schema, Types } from "mongoose";

const commentSchema = new Schema<TCommentDocument>(
  {
    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
      unique: true,
      index: true,
    },
    comments: [
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
        comment: {
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
  },
);

export const Comment = model<TCommentDocument>("Comment", commentSchema);
