import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import { bookQuerySchema } from "@/book/validation/book.js";
import type { TFavoriteDocument } from "@/favorite/interface/favorite.js";
import { Favorite } from "@/favorite/model/favorite.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { parseOrThrow, validateObjectId } from "@/utils/utils.js";
import { NotFoundError } from "http-errors-enhanced";
import type { PaginateOptions, PaginateResult } from "mongoose";

const getFavoriteBooks = async (
  customerEmail: string,
  queryPayload: unknown,
) => {
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
  } = parseOrThrow(bookQuerySchema, queryPayload);

  if (search) {
    query["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
    ];
  }

  if (sortBy && sortOrder) {
    const order = sortOrder === "desc" ? -1 : 1;
    sort[sortBy] = order;
  }

  if (fields) {
    fields.forEach((f) => {
      projectionField[f] = 1;
    });
  }

  if (excludes) {
    excludes.forEach((f) => {
      projectionField[f] = 0;
    });
  }

  const options: PaginateOptions = {
    limit,
    page,
    sort,
    projection: projectionField,
    select: "-__v",
  };

  const favDoc: TFavoriteDocument | null = await Favorite.findOne({
    customerEmail,
  });

  const bookIds = favDoc?.bookIDs.toReversed() || [];

  const result: PaginateResult<TBook> = await Book.paginate(
    { _id: { $in: bookIds } },
    options,
  );

  return getPaginatedData(result);
};

const addToFavorite = async (bookId: string, customerEmail: string) => {
  if (!validateObjectId(bookId)) {
    throw new NotFoundError("Book not found!");
  }

  let favDoc: TFavoriteDocument | null = await Favorite.findOne({
    customerEmail,
  });

  if (!favDoc) {
    favDoc = new Favorite({ customerEmail, bookIDs: [] });
  }

  favDoc.bookIDs.addToSet(bookId);
  await favDoc.save();
};

const checkInFavorites = async (bookId: string, customerEmail: string) => {
  const query = {
    customerEmail,
    bookIDs: bookId,
  };

  const result: TFavoriteDocument | null = await Favorite.findOne(query);

  return Boolean(result);
};

const removeFromFavorites = async (bookId: string, customerEmail: string) => {
  await Favorite.findOneAndUpdate(
    { customerEmail },
    { $pull: { bookIDs: bookId } },
  );
};

const services = {
  getFavoriteBooks,
  addToFavorite,
  checkInFavorites,
  removeFromFavorites,
};

export default services;
