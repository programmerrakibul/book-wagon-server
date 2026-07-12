import type { TBook } from "@/book/interface/book.js";
import type {
  TCreateOrder,
  TOrderStatus,
  TPaymentStatus,
} from "@/order/validation/order.js";
import type {
  Aggregate,
  AggregatePaginateModel,
  Document,
  Types,
} from "mongoose";

export interface TOrder extends TCreateOrder, Document {
  status: TOrderStatus;
  paymentStatus: TPaymentStatus;
  customerId: Types.ObjectId;
}

export interface TOrderModel extends AggregatePaginateModel<TOrder> {
  getOrdersByEmail(email: string): Aggregate<TOrder & { orderedBook: TBook }[]>;
  isOrdered(bookId: string, customerEmail: string): Promise<boolean>;
}
