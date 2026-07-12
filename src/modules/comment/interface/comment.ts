import type { Document, Types } from "mongoose";

export interface TCommentDocument extends Document {
  bookId: Types.ObjectId;
  comments: {
    customerEmail: string;
    customerName: string;
    customerImage: string;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}
