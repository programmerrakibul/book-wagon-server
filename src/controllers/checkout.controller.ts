import { envConfig } from "@/config/env.config.js";
import { stripe } from "@/config/stripe.config.js";
import { Book } from "@/models/book.model.js";
import { Order } from "@/models/order.model.js";
import { Payment } from "@/models/payment.model.js";
import { BadRequestError, NotFoundError } from "@/utils/utils.js";
import { PaymentStatus } from "@/validators/order.validator.js";

import type { TBookDocument } from "@/types/book.interface.js";
import type {
  TApiResponse,
  TSuccessResponse,
} from "@/types/index.interface.js";
import type {
  TOrderDocument,
  TPaymentStatus,
} from "@/types/order.interface.js";
import type { Request, Response, NextFunction } from "express";

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

    const book: TBookDocument | null = await Book.findById(bookId).lean();

    if (!book) {
      throw new NotFoundError("Book data not found!");
    }

    const { bookName, description } = book;

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            unit_amount: Math.round(Number(price)) * 100,
            currency: "usd",
            product_data: {
              name: bookName,
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
