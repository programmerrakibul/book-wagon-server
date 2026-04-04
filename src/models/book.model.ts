import paginate from "mongoose-paginate-v2";
import { model, Schema, type PaginateModel } from "mongoose";
import type {
  IBookCategory,
  TBookDocument,
  TBookFormat,
  TBookStatus,
} from "../types/book.interface.js";
import {
  BookCategory,
  BookFormat,
  BookStatus,
} from "../validators/book.validator.js";

const bookSchema = new Schema<TBookDocument>(
  {
    bookName: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    bookImage: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(BookCategory) as [IBookCategory, ...IBookCategory[]],
    },
    subcategory: {
      type: String,
      trim: true,
      default: "General",
    },
    publicationYear: {
      type: Number,
      required: true,
    },
    pageCount: {
      type: Number,
      required: true,
    },
    format: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(BookFormat) as [TBookFormat, ...TBookFormat[]],
    },
    quantity: {
      type: Number,
      required: true,
      default: 1,
    },
    price: {
      type: Number,
      required: true,
      set: (value: number) => Number(value.toFixed(2)),
      get: (value: number) => Number(value.toFixed(2)),
    },
    status: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(BookStatus) as [TBookStatus, ...TBookStatus[]],
      default: BookStatus.UNPUBLISHED,
      lowercase: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    librarianEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      getters: true,
    },
  },
);

bookSchema.plugin(paginate);

export const Book = model<TBookDocument, PaginateModel<TBookDocument>>(
  "Book",
  bookSchema,
);
