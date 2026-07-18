import type { TFavorite } from "@/favorite/interface/favorite.js";
import { model, Schema, Types, type PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const schema = new Schema<TFavorite>(
  {
    userId: {
      type: Types.ObjectId,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
      ref: "User",
    },

    bookId: {
      type: Types.ObjectId,
      ref: "Book",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "Favorite",
    versionKey: false,
  },
);

schema.plugin(paginate);

const Favorite = model<TFavorite, PaginateModel<TFavorite>>("Favorite", schema);

export default Favorite;
