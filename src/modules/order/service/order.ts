import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import { BookStatus } from "@/book/validation/book.js";
import { envConfig } from "@/config/env.js";
import stripe from "@/config/stripe.js";
import type { TOrder } from "@/order/interface/order.js";
import Order from "@/order/model/order.js";
import { successPayment } from "@/order/utils/webhook.js";
import {
  createOrderSchema,
  orderQuerySchema,
  OrderStatus,
  PaymentStatus,
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
import type Stripe from "stripe";

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

    return {
      _id: order?._id,
    };
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

const getInvoices = async (
  customerId: Types.ObjectId,
  queryPayload: unknown,
) => {
  const { limit = 10, page = 1 } = parseOrThrow(orderQuerySchema, queryPayload);
  const query = { customerId, paymentStatus: PaymentStatus.PAID };

  const opt: PaginateOptions = {
    sort: { createdAt: -1 },
    limit,
    page,
    select: "bookId transactionId createdAt totalPrice",
    populate: [
      {
        path: "bookId",
        select: "name -_id",
      },
    ],
  };

  const result = await Order.paginate(query, opt);
  const totalSpent = result.docs.reduce((acc, cur) => acc + cur.totalPrice, 0);

  return { ...getPaginatedData(result), totalSpent: double(totalSpent) };
};

const updateOrderStatus = async (id: string, payload: unknown) => {
  const { status } = parseOrThrow(updateOrderStatusSchema, payload);

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(id)
      .select("status bookId")
      .session(session);

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

    if (OrderStatus.CANCELLED === status) {
      const book = await Book.findById(order.bookId)
        .select("stock")
        .session(session);

      if (book) {
        book.stock += order.quantity;
        await book.save({ session });
      }
    }

    order.status = status;

    await order.save({ session });

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
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

const createCheckout = async (orderId: string, customerEmail: string) => {
  const CLIENT_URL = envConfig.CLIENT_URL;
  const order = await Order.findById(orderId)
    .select("bookId quantity price")
    .lean()
    .exec();

  if (!order) {
    throw new NotFoundError("Order data not found!");
  }

  const { bookId, price } = order;

  const book = await Book.findById(bookId).select("name stock").lean().exec();

  if (!book) {
    throw new NotFoundError("Book data not found! Please try another book.");
  }

  if (book.stock < order.quantity) {
    throw new BadRequestError(`Book ${book.name} is out of stock!`);
  }

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  const unit_amount = double(price * 100);

  const session = await stripe.checkout.sessions.create({
    ui_mode: "custom",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: book.name,
            metadata: {
              bookId: book._id.toString(),
              orderId,
            },
          },
          unit_amount,
        },
        quantity: order.quantity,
      },
    ],

    payment_intent_data: {
      receipt_email: customerEmail,
    },

    customer_email: customerEmail,
    metadata: {
      orderId,
      bookId: book._id.toString(),
    },

    payment_method_types: ["card"],
    mode: "payment",
    return_url: `${CLIENT_URL}/dashboard/my-orders?session_id={CHECKOUT_SESSION_ID}`,
  });

  return {
    clientSecret: session.client_secret,
  };
};

const orderWebhook = async (
  signature: string | string[] | undefined,
  payload: string,
) => {
  let event: Stripe.Event | null = null;

  if (!signature) {
    throw new BadRequestError("Missing Stripe signature!");
  }

  event = stripe.webhooks.constructEvent(
    payload,
    signature,
    envConfig.WEBHOOK_SECRET,
  );

  if (!event) {
    throw new BadRequestError("Invalid Stripe signature!");
  }

  switch (event.type) {
    case "checkout.session.completed":
      await successPayment(event.data.object);
      break;
    case "checkout.session.async_payment_succeeded":
      await successPayment(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
};

const services = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrderById,
  createCheckout,
  orderWebhook,
  getInvoices,
};

export default services;
