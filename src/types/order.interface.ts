import type z from "zod";
import type {
  orderQuerySchema,
  orderSchema,
  OrderStatus,
  PaymentStatus,
  updateOrderSchema,
} from "../validators/order.validator.js";
import type { TBookDocument } from "./book.interface.js";
import type { Aggregate, AggregatePaginateModel, Document } from "mongoose";

export type TCreateOrder = z.infer<typeof orderSchema>;
export type TUpdateOrder = z.infer<typeof updateOrderSchema>;
export type TOrderQuery = z.infer<typeof orderQuerySchema>;
export type TOrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export type TPaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface TOrderDocument extends TCreateOrder, Document {
  customerName: string;
  customerEmail: string;
  librarianEmail: string;
  orderID: string;
  status: TOrderStatus;
  paymentStatus: TPaymentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TOrderModel extends AggregatePaginateModel<TOrderDocument> {
  getOrdersByEmail(
    email: string,
  ): Aggregate<TOrderDocument & { orderedBook: TBookDocument }[]>;
  isOrdered(bookId: string, customerEmail: string): Promise<boolean>;
}
