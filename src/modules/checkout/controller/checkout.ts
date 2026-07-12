import type { TBook } from "@/book/interface/book.js";
import Book from "@/book/model/book.js";
import { envConfig } from "@/config/env.js";
import { stripe } from "@/config/stripe.js";
import {
  type TOrderDocument,
  type TPaymentStatus,
} from "@/order/interface/order.js";
import { Order } from "@/order/model/order.js";
import { PaymentStatus } from "@/order/validation/order.js";
import { Payment } from "@/payment/model/payment.js";
import type {
  TApiResponse,
  TSuccessResponse,
} from "@/types/index.interface.js";
import type { NextFunction, Request, Response } from "express";
import { BadRequestError, NotFoundError } from "http-errors-enhanced";

export const createCheckout = async (
  req: Request<{ orderID: string }>,
  res: Response<TSuccessResponse<string | null>>,
  next: NextFunction,
) => {
  try {
    const { orderID } = req.params;
    const clientUrl = envConfig.CLIENT_URL;
    const { email: customerEmail } = req.user;

    const order: TOrderDocument | null = await Order.findOne({
      orderID,
    });

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

    res.send({
      success: true,
      message: "Checkout created successfully!",
      data: session.url,
    });
  } catch (err) {
    next(err);
  }
};

export const retrieveCheckout = async (
  req: Request<{ id: string }>,
  res: Response<TApiResponse>,
  next: NextFunction,
) => {
  try {
    const {
      payment_status,
      payment_intent,
      metadata,
      customer_email,
      amount_total,
    } = await stripe.checkout.sessions.retrieve(req.params.id);

    const price = (amount_total as number) / 100;
    const orderID = metadata?.orderID as string;
    const bookId = metadata?.bookId as string;
    const paymentStatus = payment_status as TPaymentStatus;
    const transactionId = payment_intent as string;

    if (paymentStatus === PaymentStatus.PAID) {
      const isExist = await Payment.findOne({ orderID });

      if (!!isExist) {
        return res.send({
          success: true,
          message: "Payment already exist",
          data: { transactionId, orderID },
        });
      } else {
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
          {
            paymentStatus: PaymentStatus.PAID,
          },
          {
            new: true,
          },
        );

        await Payment.create(paymentInfo);

        return res.send({
          success: true,
          message: "Payment successful!",
          data: { orderID, transactionId },
        });
      }
    }

    throw new BadRequestError("Payment failed!");
  } catch (err) {
    next(err);
  }
};
