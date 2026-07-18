import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import { BookStatus } from "@/book/validation/book.js";
import type { TOrder } from "@/order/interface/order.js";
import Order from "@/order/model/order.js";
import {
  createOrderSchema,
  orderQuerySchema,
  OrderStatus,
  updateOrderStatusSchema,
  type TOrderStatus,
} from "@/order/validation/order.js";
import User from "@/user/model/user.js";
import { getPaginatedData } from "@/utils/getPaginatedData.js";
import { double, parseOrThrow } from "@/utils/utils.js";
import { BadRequestError, NotFoundError } from "http-errors-enhanced";
import type {
  PaginateOptions,
  PaginateResult,
  PopulateOptions,
  Types,
} from "mongoose";
import mongoose from "mongoose";

const createOrder = async (payload: unknown, customerId: Types.ObjectId) => {
  const parsedData = parseOrThrow(createOrderSchema, payload);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book: TBook | null = await Book.findById(parsedData.bookId)
      .select(
        "name price discount discountedPrice stock isActive status librarianId",
      )
      .session(session);

    if (!book) {
      throw new NotFoundError("Book data not found!");
    }

    if (book.status === BookStatus.UNPUBLISHED || book.isActive === false) {
      throw new BadRequestError("Book data not found!");
    }

    if (book.stock === 0) {
      throw new BadRequestError(`Book ${book.name} is out of stock!`);
    }

    if (book.stock < parsedData.quantity) {
      throw new BadRequestError(`Book ${book.name} is out of stock!`);
    }

    const price = book.discount
      ? book.discountedPrice || book.price
      : book.price;
    const totalPrice = double(price * parsedData.quantity);

    const customer = await User.findById(customerId)
      .select("orders")
      .session(session);

    if (!customer) {
      throw new NotFoundError("Customer not found!");
    }

    const orderPayload = {
      ...parsedData,
      customerId,
      price,
      totalPrice: double(totalPrice),
      librarianId: book.librarianId,
    };

    const [order] = await Order.create([orderPayload], {
      session,
    });

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

const populateOptions: PopulateOptions[] = [
  {
    path: "customerId",
    select: "name email photoUrl",
  },
  {
    path: "librarianId",
    select: "name email photoUrl",
  },
  {
    path: "bookId",
    select: "name author description photoUrl",
  },
];

const getOrders = async (queryPayload: unknown, id: Types.ObjectId) => {
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
    populate: populateOptions,
  };

  const result: PaginateResult<TOrder> = await Order.paginate(
    {
      $or: [{ customerId: id }, { librarianId: id }],
    },
    opt,
  );

  return getPaginatedData(result);
};

const getOrderById = async (id: string) => {
  const order: TOrder | null = await Order.findById(id)
    .populate(populateOptions)
    .lean()
    .exec();

  if (!order) {
    throw new NotFoundError("Order data not found!");
  }

  return order;
};

const updateOrderStatus = async (id: string, payload: unknown) => {
  const { status } = parseOrThrow(updateOrderStatusSchema, payload);

  const order: TOrder | null = await Order.findById(id).select("status");

  if (!order) {
    throw new NotFoundError("Order data not found!");
  }

  if (
    [OrderStatus.CANCELLED, OrderStatus.DELIVERED].includes(
      order.status as Extract<TOrderStatus, "CANCELLED" | "DELIVERED">,
    )
  ) {
    throw new BadRequestError("Order is already cancelled or delivered!");
  }

  order.status = status;

  await order.save();
};

const deleteOrderById = async (id: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order: TOrder | null = await Order.findById(id).session(session);

    if (!order) {
      throw new NotFoundError("Order data not found!");
    }

    if (
      [OrderStatus.DELIVERED, OrderStatus.SHIPPED].includes(
        order.status as Extract<TOrderStatus, "DELIVERED" | "SHIPPED">,
      )
    ) {
      throw new BadRequestError("Order is already delivered or shipped!");
    }

    const customer = await User.findById(order.customerId)
      .select("orders")
      .session(session);

    if (!customer) {
      throw new NotFoundError("Customer not found!");
    }

    customer.orders.pull(order._id);
    await customer.save({ session });

    await order.deleteOne({ session });

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};

const services = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrderById,
};

export default services;
