import type { Document, Model, PaginateResult, Types } from "mongoose";
import type { TBookDocument, TBookQuery } from "./book.interface.js";

export interface TFavoriteDocument extends Document {
  customerEmail: string;
  bookIDs: Types.Array<Types.ObjectId>;
}

export interface TFavoriteModel extends Model<TFavoriteDocument> {
  getFavoriteBooks(
    customerEmail: string,
    bookQuery?: TBookQuery,
  ): Promise<PaginateResult<TBookDocument>>;
}
