import type {
  TCreateOrder,
  TOrderStatus,
  TPaymentStatus,
} from "@/order/validation/order.js";
import type { Document, Types } from "mongoose";

export interface TOrder extends TCreateOrder, Document {
  status: TOrderStatus;
  paymentStatus: TPaymentStatus;
  customerId: Types.ObjectId;
  librarianId: Types.ObjectId;
  price: number;
  totalPrice: number;
}
