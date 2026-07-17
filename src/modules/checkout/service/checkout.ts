import { envConfig } from "@/config/env.js";
import { stripe } from "@/config/stripe.js";
import {
  PaymentStatus,
  type TPaymentStatus,
} from "@/order/validation/order.js";
import { Payment } from "@/payment/model/payment.js";
import type { TOrder } from "@/order/interface/order.js";
import Order from "@/order/model/order.js";
import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import { BadRequestError, NotFoundError } from "http-errors-enhanced";

const createCheckout = async (orderID: string, customerEmail: string) => {
  const clientUrl = envConfig.CLIENT_URL;

  const order: TOrder | null = await Order.findOne({ orderID });

  if (!order) {
    throw new NotFoundError("Order data not found!");
  }

  const { bookId, price } = order;

  const book: TBook | null = await Book.findById(bookId).lean();

  if (!book) {
    throw new NotFoundError("Book data not found!");
  }

  const { name, description } = book;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          unit_amount: Math.round(Number(price)) * 100,
          currency: "usd",
          product_data: {
            name,
            description,
          },
        },
        quantity: 1,
      },
    ],
    customer_email: customerEmail,
    metadata: {
      bookId: bookId.toString(),
      orderID,
    },
    mode: "payment",
    success_url: `${clientUrl}/dashboard/my-orders?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/dashboard/my-orders`,
  });

  return session.url;
};

const retrieveCheckout = async (sessionId: string) => {
  const {
    payment_status,
    payment_intent,
    metadata,
    customer_email,
    amount_total,
  } = await stripe.checkout.sessions.retrieve(sessionId);

  const price = (amount_total as number) / 100;
  const orderID = metadata?.orderID as string;
  const bookId = metadata?.bookId as string;
  const paymentStatus = payment_status as TPaymentStatus;
  const transactionId = payment_intent as string;

  if (paymentStatus === PaymentStatus.PAID) {
    const isExist = await Payment.findOne({ orderID });

    if (isExist) {
      return {
        isPaid: true,
        alreadyProcessed: true,
        transactionId,
        orderID,
      };
    }

    const paymentInfo = {
      orderID,
      transactionId,
      bookId,
      customer_email: customer_email as string,
      paymentStatus,
      price,
    };

    await Order.findOneAndUpdate(
      { orderID },
      { paymentStatus: PaymentStatus.PAID },
      { new: true },
    );

    await Payment.create(paymentInfo);

    return {
      isPaid: true,
      alreadyProcessed: false,
      transactionId,
      orderID,
    };
  }

  throw new BadRequestError("Payment failed!");
};

const services = {
  createCheckout,
  retrieveCheckout,
};

export default services;
