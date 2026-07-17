import type { TBook } from "@/book/interface/book.js";
import { BookStatus } from "@/book/validation/book.js";
import { double } from "@/utils/utils.js";
import { model, Schema, type PaginateModel } from "mongoose";
import paginate from "mongoose-paginate-v2";

const schema = new Schema<TBook>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    author: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    photoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    categoryId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Category",
      index: true,
    },

    subcategoryId: {
      type: Schema.Types.ObjectId,
      required: false,
      ref: "SubCategory",
      index: true,
    },

    librarianId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },

    publicationYear: {
      type: Number,
      required: true,
    },

    pageCount: {
      type: Number,
      required: true,
    },

    formatId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "BookFormat",
      index: true,
    },

    stock: {
      type: Number,
      required: true,
      default: 1,
    },

    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    discountedPrice: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      required: true,
      trim: true,
      enum: Object.values(BookStatus),
      default: BookStatus.PUBLISHED,
      uppercase: true,
      index: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    weight: {
      type: Number,
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },

  {
    timestamps: true,
    collection: "Book",
    versionKey: false,
  },
);

schema.pre("save", function () {
  if (this.isModified("price") || this.isModified("discount")) {
    if (this.discount && this.discount > 0) {
      this.discountedPrice = double(
        this.price - (this.price * this.discount) / 100,
      );
    } else {
      this.discountedPrice = 0;
    }
  }
});

schema.plugin(paginate);

const Book = model<TBook, PaginateModel<TBook>>("Book", schema);
export default Book;
