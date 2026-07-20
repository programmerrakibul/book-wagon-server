import Book from "@/book/model/book.js";
import Order from "@/order/model/order.js";
import mongoose from "mongoose";
import type Stripe from "stripe";
import { PaymentStatus } from "../validation/order.js";

export const successPayment = async (data: Stripe.Checkout.Session) => {
  const { orderId, bookId } = data.metadata || {};

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const order = await Order.findById(orderId)
      .select("paymentStatus quantity transactionId")
      .session(session);
    const book = await Book.findById(bookId).select("stock").session(session);

    if (!order || !book) return;

    order.paymentStatus = PaymentStatus.PAID;
    order.transactionId = data.payment_intent
      ? (data.payment_intent as string)
      : "";
    book.stock -= order.quantity;

    await order.save({ session });
    await book.save({ session });
    console.log("Payment successful!");

    await session.commitTransaction();
  } catch (error: unknown) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
};
