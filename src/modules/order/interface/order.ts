import type { TBook } from "@/book/interface/book.js";
import type {
  orderQuerySchema,
  orderSchema,
  OrderStatus,
  PaymentStatus,
  updateOrderSchema,
} from "@/order/validation/order.js";
import type { Aggregate, AggregatePaginateModel, Document } from "mongoose";
import type z from "zod";

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
  ): Aggregate<TOrderDocument & { orderedBook: TBook }[]>;
  isOrdered(bookId: string, customerEmail: string): Promise<boolean>;
}
