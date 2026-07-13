import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import { BookStatus } from "@/book/validation/book.js";
import type { TOrder } from "@/order/interface/order.js";
import Order from "@/order/model/order.js";
import {
  createOrderSchema,
  orderQuerySchema,
} from "@/order/validation/order.js";
import { User } from "@/user/model/user.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { double, parseOrThrow } from "@/utils/utils.js";
import { BadRequestError, NotFoundError } from "http-errors-enhanced";
import type { PaginateOptions, PaginateResult, Types } from "mongoose";
import mongoose from "mongoose";

const createOrder = async (payload: unknown, customerId: Types.ObjectId) => {
  const parsedData = parseOrThrow(createOrderSchema, payload);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItemsMap = new Map(
      parsedData.books.map((item) => [item.bookId.toString(), item]),
    );

    const bookIds = Array.from(orderItemsMap.keys());
    const books: TBook[] = await Book.find({ _id: { $in: bookIds } })
      .select("name stock isActive status price discount discountPrice")
      .session(session);

    if (books.length !== bookIds.length) {
      throw new NotFoundError(
        "One or more requested books could not be found.",
      );
    }

    let totalPrice = 0;

    for (const book of books) {
      const requestedItem = orderItemsMap.get(book._id.toString());

      if (!requestedItem) continue;

      if (book.status === BookStatus.UNPUBLISHED || !book.isActive) {
        throw new NotFoundError(`Book "${book.name}" is no longer available.`);
      }

      if (book.stock === 0) {
        throw new BadRequestError(
          `Book "${book.name}" is completely out of stock!`,
        );
      }

      if (book.stock < requestedItem.quantity) {
        throw new BadRequestError(
          `Not enough stock for "${book.name}". Requested: ${requestedItem.quantity}, Available: ${book.stock}`,
        );
      }

      totalPrice +=
        (book.discount ? book.discountedPrice : book.price) *
        requestedItem.quantity;
      book.stock -= requestedItem.quantity;
    }

    await Promise.all(books.map((book) => book.save({ session })));

    const orderPayload = {
      ...parsedData,
      customerId,
      totalPrice: double(totalPrice),
    };

    const [order] = await Order.create([orderPayload], {
      session,
    });

    const customer = await User.findById(customerId)
      .select("orders")
      .session(session);

    if (!customer) {
      throw new NotFoundError("Customer not found!");
    }

    customer.orders.push(order?._id);
    await customer.save({ session });

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();

    throw error;
  } finally {
    await session.endSession();
  }
};

const getOrders = async (queryPayload: unknown, customerId: Types.ObjectId) => {
  const sort: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  const {
    limit = 10,
    page = 1,
    sortBy,
    sortOrder,
  } = parseOrThrow(orderQuerySchema, queryPayload);

  if (sortBy && sortOrder) {
    const order = sortOrder === "desc" ? -1 : 1;
    sort[sortBy] = order;

    delete sort.createdAt;
  }

  const opt: PaginateOptions = {
    sort,
    limit,
    page,
    populate: [
      {
        path: "customerId",
        select: "name email photoUrl",
      },
      {
        path: "books.bookId",
        select: "name author description photoUrl",
      },
    ],
  };

  const result: PaginateResult<TOrder> = await Order.paginate(
    { customerId },
    opt,
  );

  return getPaginatedData(result);
};

const services = {
  createOrder,
  getOrders,
};

export default services;
