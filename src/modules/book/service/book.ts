import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import {
  bookQuerySchema,
  BookStatus,
  createBookSchema,
  updateBookSchema,
} from "@/book/validation/book.js";
import Category from "@/category/model/category.js";
import { Order } from "@/models/order.model.js";
import { User } from "@/models/user.model.js";
import type { TUserRole } from "@/types/user.interface.js";
import {
  parseOrThrow,
  transformToObjectId,
  validateObjectId,
} from "@/utils/utils.js";
import { UserRole } from "@/validations/user.validator.js";
import { BadRequestError, NotFoundError } from "http-errors-enhanced";
import mongoose, {
  Types,
  type PaginateOptions,
  type PaginateResult,
  type PopulateOptions,
} from "mongoose";

const createBook = async (payload: unknown, librarianEmail: string) => {
  const parsedData = parseOrThrow(createBookSchema, payload);
  await Book.create({ ...parsedData, librarianEmail });
};

const getBooks = async (queryPayload: unknown) => {
  const roles = Object.values(UserRole).filter((r) => r !== UserRole.USER);

  const query: Record<string, unknown> = {
    status: BookStatus.PUBLISHED,
    isActive: true,
  };

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
    category,
    email,
  } = parseOrThrow(bookQuerySchema, queryPayload);

  if (email) {
    const role = await User.getRole(email);

    if (roles.includes(role as Exclude<TUserRole, "user">)) {
      delete query.status;
      delete query.isActive;
    }

    if (role === UserRole.LIBRARIAN) {
      query.librarianEmail = email;
      delete query.isActive;
    }
  }

  if (category) {
    if (validateObjectId(category)) {
      query.categoryId = transformToObjectId(category);
    } else {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query.categoryId = categoryDoc._id;
      } else {
        query.categoryId = new Types.ObjectId();
      }
    }
  }

  if (search) {
    query["$or"] = [
      { name: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      {
        description: {
          $regex: search,
          $options: "i",
        },
      },
      {
        librarianEmail: {
          $regex: search,
          $options: "i",
        },
      },
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
    populate: [
      {
        path: "categoryId",
        select: "name slug",
      },
      {
        path: "subcategoryId",
        select: "name slug",
      },
      {
        path: "formatId",
        select: "name",
      },
    ],
  };

  const result: PaginateResult<TBook> = await Book.paginate(query, options);

  return result;
};

const getBookById = async (id: string) => {
  if (!validateObjectId(id)) {
    throw new BadRequestError("Provided id is not valid MongoDB id!");
  }

  const populateOptions: PopulateOptions[] = [
    {
      path: "categoryId",
      select: "name slug",
    },
    {
      path: "subcategoryId",
      select: "name slug",
    },
    {
      path: "formatId",
      select: "name",
    },
  ];

  const book: TBook | null = await Book.findById(id)
    .populate(populateOptions)
    .lean();

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  return book;
};

const updateBookById = async (id: string, payload: unknown) => {
  if (!validateObjectId(id)) {
    throw new BadRequestError("Provided id is not valid MongoDB id!");
  }

  const parsedData = parseOrThrow(updateBookSchema, payload);

  const book: TBook | null = await Book.findById(id);

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  Object.assign(book, parsedData);

  await book.save();
};

const deleteBookById = async (id: string) => {
  if (!validateObjectId(id)) {
    throw new BadRequestError("Provided id is not valid MongoDB id!");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book: TBook | null = await Book.findById(id).session(session);

    if (!book) {
      throw new NotFoundError("Book data not found!");
    }

    await Order.deleteMany({ bookId: id }).session(session);

    await book.deleteOne({ session });

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const services = {
  createBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
};

export default services;
