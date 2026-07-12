import type { TBook } from "@/book/interface/book.js";
import type { TBookQuery } from "@/book/validation/book.js";
import type { Document, Model, PaginateResult, Types } from "mongoose";

export interface TFavoriteDocument extends Document {
  customerEmail: string;
  bookIDs: Types.Array<Types.ObjectId>;
}

export interface TFavoriteModel extends Model<TFavoriteDocument> {
  getFavoriteBooks(
    customerEmail: string,
    bookQuery?: TBookQuery,
  ): Promise<PaginateResult<TBook>>;
}
