import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import { bookQuerySchema } from "@/book/validation/book.js";
import type { TFavorite } from "@/favorite/interface/favorite.js";
import Favorite from "@/favorite/model/favorite.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { parseOrThrow, transformToObjectId } from "@/utils/utils.js";
import { NotFoundError } from "http-errors-enhanced";
import type { PaginateOptions, PaginateResult, Types } from "mongoose";

const getFavoriteBooks = async (
  userId: Types.ObjectId,
  queryPayload: unknown,
) => {
  const query: Record<string, unknown> = {};

  let sort: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  const {
    search,
    sortBy,
    sortOrder,
    limit = 10,
    page = 1,
  } = parseOrThrow(bookQuerySchema, queryPayload);

  if (search) {
    query["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (sortBy && sortOrder) {
    const order = sortOrder === "desc" ? -1 : 1;
    sort[sortBy] = order;
  }

  const options: PaginateOptions = {
    limit,
    page,
    sort,
    select: "name author description photoUrl",
  };

  const favDoc: TFavorite | null = await Favorite.findOne({
    userId,
  }).select("books");

  const bookIds = favDoc?.books.toReversed() || [];

  const result: PaginateResult<TBook> = await Book.paginate(
    {
      _id: { $in: bookIds },
    },
    options,
  );

  return getPaginatedData(result);
};

const addToFavorite = async (bookId: string, userId: Types.ObjectId) => {
  const id = transformToObjectId(bookId);
  const book = await Book.exists(id);

  if (!book) {
    throw new NotFoundError("Book not found!");
  }

  let favDoc: TFavorite | null = await Favorite.findOne({
    userId,
  }).select("books");

  if (!favDoc) {
    favDoc = new Favorite({ userId, books: [] });
  }

  favDoc.books.addToSet(bookId);
  await favDoc.save();
};

const checkInFavorites = async (bookId: string, userId: Types.ObjectId) => {
  const query = {
    userId,
    books: transformToObjectId(bookId),
  };

  const result = await Favorite.exists(query);

  return Boolean(result);
};

const removeFromFavorites = async (bookId: string, userId: Types.ObjectId) => {
  const id = transformToObjectId(bookId);
  const book = await Book.exists(id);

  if (!book) {
    throw new NotFoundError("This book does not exist!");
  }

  const favDoc: TFavorite | null = await Favorite.findOne({
    userId,
    books: id,
  }).select("books");

  if (!favDoc) {
    throw new NotFoundError("This book is not in your favorites!");
  }

  favDoc.books.pull(bookId);
  await favDoc.save();
};

const services = {
  getFavoriteBooks,
  addToFavorite,
  checkInFavorites,
  removeFromFavorites,
};

export default services;
