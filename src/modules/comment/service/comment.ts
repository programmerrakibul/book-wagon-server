import Book from "@/book/model/book.js";
import Comment from "@/comment/model/comment.js";
import {
  createCommentSchema,
  querySchema,
} from "@/comment/validation/comment.js";
import User from "@/user/model/user.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { parseOrThrow, transformToObjectId } from "@/utils/utils.js";
import { NotFoundError } from "http-errors-enhanced";
import type { PopulateOptions, Types } from "mongoose";

const createComment = async (_id: Types.ObjectId, payload: unknown) => {
  const { comment, bookId } = parseOrThrow(createCommentSchema, payload);

  const book = await Book.exists(bookId);

  if (!book) {
    throw new NotFoundError("Book not found!");
  }

  const user = await User.exists(_id);

  if (!user) {
    throw new NotFoundError("User not found!");
  }

  await Comment.create({ bookId, userId: _id, comment });
};

const getCommentsByBookId = async (id: string, queryPayload: unknown) => {
  const bookId = transformToObjectId(id);
  const { limit = 10, page = 1 } = parseOrThrow(querySchema, queryPayload);
  const book = await Book.exists(bookId);

  if (!book) {
    throw new NotFoundError("Book not found!");
  }

  const populateOptions: PopulateOptions[] = [
    {
      path: "userId",
      select: "name email photoUrl",
    },
  ];

  const options = {
    page,
    limit,
    populate: populateOptions,
    sort: { createdAt: -1 },
  };

  const result = await Comment.paginate({ bookId }, options);

  return getPaginatedData(result);
};

const services = {
  createComment,
  getCommentsByBookId,
};

export default services;
