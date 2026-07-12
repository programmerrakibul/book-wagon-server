import type { TOrderStatus, TPaymentStatus } from "@/order/interface/order.js";
import { userQuerySchema } from "@/user/validation/user.js";
import { objectIdSchema } from "@/validations/objectId.validator.js";
import { Types } from "mongoose";
import z from "zod";

export const OrderStatus = {
  PENDING: "pending",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export const PaymentStatus = {
  PAID: "paid",
  UNPAID: "unpaid",
  PENDING: "pending",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export const orderSchema = z.object(
  {
    bookId: objectIdSchema.transform((val) => new Types.ObjectId(val)),
    price: z.coerce
      .number({
        error: (iss) => {
          return iss.input === undefined || iss.received === "NaN"
            ? "Price is required!"
            : "Please provide a valid price!";
        },
      })
      .min(1, "Price must be positive!")
      .max(999999.99, "Price is too high!"),
    phone: z.string({
      error: (iss) => {
        return iss.input === undefined
          ? "Phone number is required!"
          : "Please provide a valid phone number!";
      },
    }),
    address: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Address is required!"
            : "Please provide a valid address!";
        },
      })
      .min(3, "Address must be at least 3 characters long")
      .max(100, "Address cannot exceed 100 characters"),
  },
  "Order data is required in the request body!",
);

export const updateOrderSchema = orderSchema
  .extend({
    status: z.enum(
      Object.values(OrderStatus) as [TOrderStatus, ...TOrderStatus[]],
      "Status must be one of pending, shipped, delivered, cancelled",
    ),
    paymentStatus: z.enum(
      Object.values(PaymentStatus) as [TPaymentStatus, ...TPaymentStatus[]],
      "Payment status must be one of paid, unpaid, pending, failed, refunded",
    ),
  })
  .partial();

export const orderQuerySchema = userQuerySchema;
