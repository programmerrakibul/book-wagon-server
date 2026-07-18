import type { TComment } from "@/comment/interface/comment.js";
import { model, Schema, Types, type PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const schema = new Schema<TComment>(
  {
    bookId: {
      type: Types.ObjectId,
      required: true,
      ref: "Book",
      index: true,
    },

    userId: {
      type: Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: "Comment",
    versionKey: false,
  },
);

schema.plugin(paginate);

const Comment = model<TComment, PaginateModel<TComment>>("Comment", schema);
export default Comment;
