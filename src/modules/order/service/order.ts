import Book from "@/book/model/book.js";
import { Order } from "@/order/model/order.js";
import { createOrderSchema } from "@/order/validation/order.js";
import { parseOrThrow } from "@/utils/utils.js";
import { BadRequestError, NotFoundError } from "http-errors-enhanced";
import type { Types } from "mongoose";
import mongoose from "mongoose";

const createOrder = async (payload: unknown, id: Types.ObjectId) => {
  const parsedData = parseOrThrow(createOrderSchema, payload);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const book = await Book.findById(parsedData.bookId)
      .select("name quantity")
      .session(session);

    if (!book) {
      throw new NotFoundError("Book not found!");
    }

    if (book.quantity === 0) {
      throw new BadRequestError("Book is out of stock!");
    }

    if (book.quantity < parsedData.quantity) {
      throw new BadRequestError("Book quantity is not enough!");
    }

    book.quantity -= parsedData.quantity;

    await book.save({ session });

    (await Order.create({ ...parsedData, customerId: id })).$session(session);

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
};

export default services;
