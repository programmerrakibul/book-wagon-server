import type { AggregatePaginateModel, Document, Types } from "mongoose";
import type z from "zod";
import type { paymentQuerySchema } from "../validations/payment.validator.js";
import type { TPaymentStatus } from "./order.interface.js";

export interface TPaymentDocument extends Document {
  orderID: string;
  transactionId: string;
  bookId: Types.ObjectId;
  customer_email: string;
  paymentStatus: TPaymentStatus;
  price: number;
}

export interface TPaymentModel extends AggregatePaginateModel<TPaymentDocument> {}

export type TPaymentQuery = z.infer<typeof paymentQuerySchema>;
