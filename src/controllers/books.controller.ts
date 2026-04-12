import { Book } from "@/models/book.model.js";
import { Order } from "@/models/order.model.js";
import { User } from "@/models/user.model.js";
import { NotFoundError } from "@/utils/utils.js";
import { bookQuerySchema } from "@/validators/book.validator.js";

import type {
  TBookCategory,
  TBookDocument,
  TBookQuery,
  TCreateBook,
  TUpdateBook,
} from "@/types/book.interface.js";
import type {
  TPaginatedResponse,
  TSuccessResponse,
} from "@/types/index.interface.js";
import type { Request, Response, NextFunction } from "express";
import type { PaginateOptions, PaginateResult } from "mongoose";

export const getBooks = async (
  req: Request<{}, {}, {}, TBookQuery>,
  res: Response<TPaginatedResponse<TBookDocument>>,
  next: NextFunction,
) => {
  try {
    const roles = ["admin", "librarian"];

    const query: Record<string, unknown> = {
      status: "published",
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
    } = bookQuerySchema.parse(req.query);

    if (email) {
      const role = await User.getRole(email);

      roles.includes(role) && delete query.status;
      role === "librarian" && (query.librarianEmail = email);
    }

    if (category) {
      query.category = category;
    }

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

    const { docs, ...pagination }: PaginateResult<TBookDocument> =
      await Book.paginate(query, options);

    res.send({
      success: true,
      message: "Books data retrieved successfully",
      data: docs,
      pagination: {
        totalDocs: pagination.totalDocs,
        hasPrevPage: pagination.hasPrevPage,
        hasNextPage: pagination.hasNextPage,
        totalPages: pagination.totalPages,
        page: pagination.page,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getBookById = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse<TBookDocument>>,
  next: NextFunction,
) => {
  try {
    const book: TBookDocument | null = await Book.findById(req.params.id)
      .select("-__v")
      .lean();

    if (!book || book.status === "unpublished") {
      throw new NotFoundError("Book data not found!");
    }

    res.send({
      success: true,
      message: "Book data retrieved successfully",
      data: book,
    });
  } catch (err) {
    next(err);
  }
};

export const postBook = async (
  req: Request<{}, {}, TCreateBook>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { email } = req.user;
    await Book.create({ ...req.body, librarianEmail: email });

    res.status(201).send({
      success: true,
      message: "Book data posted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateBookById = async (
  req: Request<{ id: string }, {}, TUpdateBook>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const book: TBookDocument | null = await Book.findById(id);

    if (!book) {
      throw new NotFoundError("Book data not found!");
    }

    await Book.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.send({
      success: true,
      message: "Book data updated successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteBookById = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const book: TBookDocument | null = await Book.findById(id);

    if (!book) {
      throw new NotFoundError("Book data not found!");
    }

    await Order.deleteMany({ bookId: id });
    await Book.findByIdAndDelete(id);

    res.send({
      success: true,
      message: "Book data deleted successfully!",
    });
  } catch (err) {
    next(err);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response<TSuccessResponse<TBookCategory[]>>,
  next: NextFunction,
) => {
  try {
    const result: Pick<TBookDocument, "category">[] = await Book.find(
      {},
    ).select("category -_id");

    const categories: TBookCategory[] = [
      ...new Set(result.map((b) => b.category)),
    ].map((c, i) => {
      const cat: TBookCategory = {
        _id: i + 1,
        name: c,
      };

      return cat;
    });

    res.send({
      success: true,
      message: "Categories data retrieved successfully!",
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};
