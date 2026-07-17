import type { TPaymentStatus } from "@/order/validation/order.js";
import type { paymentQuerySchema } from "@/payment/validation/payment.js";
import type { Document, PaginateModel, Types } from "mongoose";
import type z from "zod";

export interface TPaymentDocument extends Document {
  orderID: string;
  transactionId: string;
  bookId: Types.ObjectId;
  customer_email: string;
  paymentStatus: TPaymentStatus;
  price: number;
}

export interface TPaymentModel extends PaginateModel<TPaymentDocument> {}

export type TPaymentQuery = z.infer<typeof paymentQuerySchema>;
