import type { Document, Types } from "mongoose";

export interface TFavorite extends Document {
  userId: Types.ObjectId;
  books: Types.Array<Types.ObjectId>;
}
