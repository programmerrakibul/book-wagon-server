import Book from "@/book/model/book.js";
import { bookQuerySchema } from "@/book/validation/book.js";
import Favorite from "@/favorite/model/favorite.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { parseOrThrow, transformToObjectId } from "@/utils/utils.js";
import { NotFoundError } from "http-errors-enhanced";
import type { PaginateOptions, Types } from "mongoose";

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
      { "bookId.name": { $regex: search, $options: "i" } },
      { "bookId.author": { $regex: search, $options: "i" } },
      { "bookId.description": { $regex: search, $options: "i" } },
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
    populate: [
      {
        path: "bookId",
        select: "name author photoUrl price discount discountedPrice",
      },
    ],
  };

  const result = await Favorite.paginate({ userId }, options);

  return getPaginatedData(result);
};

const toggleFavorite = async (bookId: string, userId: Types.ObjectId) => {
  const id = transformToObjectId(bookId);
  const book = await Book.exists(id);

  if (!book) {
    throw new NotFoundError("Book not found!");
  }

  const favDoc = await Favorite.findOne({
    userId,
    bookId,
  });

  if (favDoc) {
    await favDoc.deleteOne();

    return "Book removed from favorites successfully!";
  }

  await Favorite.create({
    userId,
    bookId,
  });

  return "Book added to favorites successfully!";
};

const checkInFavorites = async (bookId: string, userId: Types.ObjectId) => {
  const result = await Favorite.exists({
    userId,
    bookId,
  }).exec();

  return Boolean(result);
};

const services = {
  getFavoriteBooks,
  toggleFavorite,
  checkInFavorites,
};

export default services;
