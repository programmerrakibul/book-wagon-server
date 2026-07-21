import type { Document, Types } from "mongoose";

export interface TFavorite extends Document {
  userId: Types.ObjectId;
  bookId: Types.ObjectId;
}
