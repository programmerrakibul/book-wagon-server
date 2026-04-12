import { Book } from "./book.model.js";
import { bookQuerySchema } from "@/validators/book.validator.js";

import type { TBookDocument, TBookQuery } from "@/types/book.interface.js";
import type {
  TFavoriteDocument,
  TFavoriteModel,
} from "@/types/favorite.interface.js";
import {
  model,
  Schema,
  Types,
  type PaginateOptions,
  type PaginateResult,
} from "mongoose";

const favoriteSchema = new Schema<TFavoriteDocument>(
  {
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
    },
    bookIDs: [
      {
        type: Types.ObjectId,
        ref: "Book",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
  },
);

favoriteSchema.statics.getFavoriteBooks = async function (
  customerEmail: string,
  bookQuery: TBookQuery,
) {
  try {
    const query: Record<string, unknown> = {};

    let sort: Record<string, 1 | -1> = {
      createdAt: -1,
    };
    let projectionField: Record<string, 1 | 0> = {};

    const {
      search,
      sortBy,
      sortOrder,
      limit = 10,
      page = 1,
      fields,
      excludes,
    } = bookQuerySchema.parse(bookQuery);

    if (search) {
      query["$or"] = [
        { bookName: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    if (sortBy && sortOrder) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;
    }

    if (fields) {
      fields.forEach((f) => {
        projectionField![f] = 1;
      });
    }

    if (excludes) {
      excludes.forEach((f) => {
        projectionField![f] = 0;
      });
    }

    const options: PaginateOptions = {
      limit,
      page,
      sort,
      projection: projectionField,
      select: "-__v",
    };

    const favDoc: TFavoriteDocument | null = await this.findOne({
      customerEmail,
    });

    const bookIds = favDoc?.bookIDs.toReversed() || [];

    return (await Book.paginate(
      { _id: { $in: bookIds } },
      options,
    )) as PaginateResult<TBookDocument>;
  } catch (error) {
    throw error;
  }
};

export const Favorite = model<TFavoriteDocument, TFavoriteModel>(
  "Favorite",
  favoriteSchema,
);
