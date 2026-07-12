import type { TBookFormat } from "@/book-format/interface/book-format.js";
import mongoose from "mongoose";

const schema = new mongoose.Schema<TBookFormat>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    photoUrl: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      default: "",
    },
  },

  {
    timestamps: true,
    collection: "BookFormat",
    versionKey: false,
  },
);

const BookFormat = mongoose.model<TBookFormat>("BookFormat", schema);
export default BookFormat;
