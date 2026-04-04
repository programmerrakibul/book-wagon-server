import { Order } from "../models/order.model.js";
import type { Request, Response, NextFunction } from "express";
import { NotFoundError } from "../utils/utils.js";
import { User } from "../models/user.model.js";
import type { TUserDocument } from "../types/user.interface.js";
import type {
  TCreateOrder,
  TOrderDocument,
  TOrderQuery,
  TUpdateOrder,
} from "../types/order.interface.js";
import type {
  TPaginatedResponse,
  TSuccessResponse,
} from "../types/index.interface.js";
import { Book } from "../models/book.model.js";
import type { TBookDocument } from "../types/book.interface.js";
import { orderQuerySchema } from "../validators/order.validator.js";
import type { PaginateOptions } from "mongoose";

export const getAllOrders = async (
  req: Request<{}, {}, {}, TOrderQuery>,
  res: Response<TPaginatedResponse<{ orderedBook: TBookDocument }>>,
  next: NextFunction,
) => {
  try {
    const sort: Record<string, 1 | -1> = {
      createdAt: -1,
    };

    const {
      limit = 10,
      page = 1,
      sortBy,
      sortOrder,
    } = orderQuerySchema.parse(req.query);

    if (sortBy && sortOrder) {
      const order = sortOrder === "desc" ? -1 : 1;
      sort[sortBy] = order;

      delete sort.createdAt;
    }

    const opt: PaginateOptions = {
      sort,
      limit,
      page,
    };

    const aggregate = Order.getOrdersByEmail(req.user.email);

    const result = await Order.aggregatePaginate(aggregate, opt);

    const { docs, ...pagination } = result;

    res.send({
      success: true,
      message: "Orders data retrieved successfully!",
      data: docs,
      pagination: {
        totalDocs: pagination.totalDocs,
        hasPrevPage: pagination.hasPrevPage,
        hasNextPage: pagination.hasNextPage,
        totalPages: pagination.totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const isOrdered = async (
  req: Request<{ id: string }>,
  res: Response<TSuccessResponse<boolean>>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { email } = req.user;

    const result = await Order.isOrdered(id, email);

    res.send({
      success: true,
      message: "Order status retrieved successfully",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

export const postOrder = async (
  req: Request<{}, {}, TCreateOrder>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { email } = req.user;
    const { bookId, ...orderData } = req.body;

    const book: TBookDocument | null = await Book.findById(bookId);
    const user: TUserDocument | null = await User.findOne({ email });

    if (!book) {
      throw new NotFoundError("Book data not found!");
    }

    if (!user) {
      throw new NotFoundError("Customer data not found!");
    }

    await Order.create({
      bookId,
      ...orderData,
      customerEmail: email,
      customerName: user.name,
      librarianEmail: book.librarianEmail,
    });

    res.status(201).send({
      success: true,
      message: "Order data posted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (
  req: Request<{ id: string }, {}, TUpdateOrder>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const order: TOrderDocument | null = await Order.findById(id);

    if (!order) {
      throw new NotFoundError("Order data not found!");
    }

    await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.send({
      success: true,
      message: "Order data updated successfully!",
    });
  } catch (err) {
    next(err);
  }
};
