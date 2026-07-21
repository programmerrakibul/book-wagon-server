import BookFormat from "@/book-format/model/book-format.js";
import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import {
  bookQuerySchema,
  BookStatus,
  createBookSchema,
  updateBookActiveStatusSchema,
  updateBookSchema,
  updateBookStatusSchema,
  type TCreateBook,
} from "@/book/validation/book.js";
import Category from "@/category/model/category.js";
import Order from "@/order/model/order.js";
import SubCategory from "@/sub-category/model/sub-category.js";
import User from "@/user/model/user.js";
import type { TUserRole } from "@/user/validation/user.js";
import { UserRole } from "@/user/validation/user.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import {
  parseOrThrow,
  transformToObjectId,
  validateObjectId,
} from "@/utils/utils.js";
import { NotFoundError } from "http-errors-enhanced";
import mongoose, {
  Types,
  type PaginateOptions,
  type PaginateResult,
  type PopulateOptions,
} from "mongoose";

const bookPopulateOptions: PopulateOptions[] = [
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
  {
    path: "librarianId",
    select: "name email",
  },
];

const createBook = async (
  payload: unknown,
  librarianId: TBook["librarianId"],
) => {
  const parsedData = parseOrThrow(createBookSchema, payload);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const category = await Category.exists(parsedData.categoryId).session(
      session,
    );

    if (!category) {
      throw new NotFoundError(
        "This category does not exist! Please try another!",
      );
    }

    if (parsedData.subcategoryId) {
      const subcategory = await SubCategory.exists(
        parsedData.subcategoryId,
      ).session(session);

      if (!subcategory) {
        throw new NotFoundError(
          "This subcategory does not exist! Please try another!",
        );
      }
    }

    const format = await BookFormat.exists(parsedData.formatId).session(
      session,
    );

    if (!format) {
      throw new NotFoundError(
        "This format does not exist! Please try another!",
      );
    }

    const [book] = await Book.create([{ ...parsedData, librarianId }], {
      session,
    });

    const librarian = await User.findById(librarianId).session(session);

    if (!librarian) {
      throw new NotFoundError("Librarian not found!");
    }

    librarian.books.push(book?._id);
    await librarian.save({ session });

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
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

  const {
    search,
    sortBy,
    sortOrder,
    limit = 10,
    page = 1,
    category,
    email,
  } = parseOrThrow(bookQuerySchema, queryPayload);

  if (email) {
    const user = await User.findOne({ email }).select("role").lean().exec();

    if (user) {
      const { role, _id } = user;

      if (roles.includes(role as Exclude<TUserRole, "USER">)) {
        delete query.status;

        if (role === UserRole.LIBRARIAN) query.librarianId = _id;
        if (role === UserRole.ADMIN) delete query.isActive;
      }
    }
  }

  if (category) {
    if (validateObjectId(category)) {
      query.categoryId = transformToObjectId(category);
    } else {
      const categoryDoc = await Category.findOne({ slug: category })
        .select("_id")
        .lean()
        .exec();

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
    ];
  }

  if (sortBy && sortOrder) {
    const order = sortOrder === "desc" ? -1 : 1;
    sort[sortBy] = order;

    sortBy !== "createdAt" && delete sort.createdAt;
  }

  const options: PaginateOptions = {
    limit,
    page,
    sort,
    populate: bookPopulateOptions,
  };

  const result: PaginateResult<TBook> = await Book.paginate(query, options);

  return getPaginatedData(result);
};

const getBookById = async (id: string) => {
  const book: TBook | null = await Book.findById(id)
    .populate(bookPopulateOptions)
    .lean()
    .exec();

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  return book;
};

const updateBookById = async (id: string, payload: unknown) => {
  const parsedData = parseOrThrow(updateBookSchema, payload);

  const book: TBook | null = await Book.findById(id);

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  const data: TCreateBook = {
    name: parsedData.name || book.name,
    author: parsedData.author || book.author,
    description: parsedData.description || book.description,
    photoUrl: parsedData.photoUrl || book.photoUrl,
    categoryId: parsedData.categoryId || book.categoryId,
    subcategoryId: parsedData.subcategoryId || book.subcategoryId,
    formatId: parsedData.formatId || book.formatId,
    price: parsedData.price || book.price,
    discount: parsedData.discount || book.discount,
    stock: parsedData.stock || book.stock,
    publicationYear: parsedData.publicationYear || book.publicationYear,
    pageCount: parsedData.pageCount || book.pageCount,
    quantity: parsedData.quantity || book.quantity,
    status: parsedData.status || book.status,
    weight: parsedData.weight || book.weight,
  };

  Object.assign(book, data);

  await book.save();
};

const updateBookStatusById = async (id: string, payload: unknown) => {
  const book: TBook | null = await Book.findById(id).select("status");

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  const { status } = parseOrThrow(updateBookStatusSchema, payload);
  book.status = status;

  await book.save();
};

const updateBookActiveStatusById = async (id: string, payload: unknown) => {
  const { isActive } = parseOrThrow(updateBookActiveStatusSchema, payload);
  const book: TBook | null = await Book.findById(id).select("isActive");

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  book.isActive = isActive;
  await book.save();
};

const deleteBookById = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book: TBook | null = await Book.findById(id)
      .select("librarianId")
      .session(session);

    if (!book) {
      throw new NotFoundError("Book data not found!");
    }

    const librarian = await User.findById(book.librarianId)
      .select("books")
      .session(session);

    if (!librarian) {
      throw new NotFoundError("Librarian not found!");
    }

    librarian.books.pull(id);
    await librarian.save({ session });

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
  updateBookStatusById,
  deleteBookById,
  updateBookActiveStatusById,
};

export default services;
