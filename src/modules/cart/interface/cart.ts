import type { Document, Types } from "mongoose";

export interface TCartDocument extends Document {
  userId: Types.ObjectId;
  items: {
    bookId: Types.ObjectId;
    quantity: number;
    addedAt: Date;
  }[];
}
