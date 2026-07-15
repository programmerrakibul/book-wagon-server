import { paginationQuery, searchQuery, sortQuery } from "@/lib/query.js";
import { transformToObjectId, validateObjectId } from "@/utils/utils.js";
import z from "zod";

export const OrderStatus = {
  PENDING: "PENDING",
  SHIPPED: "SHIPPED",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
} as const;

export const PaymentStatus = {
  UNPAID: "UNPAID",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
} as const;

export const createOrderSchema = z.object({
  bookId: z
    .string("Please provide a valid book ID!")
    .trim()
    .min(1, "Book ID is required!")
    .refine((val) => {
      return validateObjectId(val);
    }, "Please provide a valid MongoDB ID!")
    .transform((val) => transformToObjectId(val)),

  quantity: z.coerce
    .number("Please provide a valid quantity!")
    .min(1, "Quantity must be at least 1")
    .max(9999, "Quantity cannot exceed 9999"),

  phoneNumber: z
    .string("Please provide a valid Phone Number!")
    .trim()
    .min(1, "Phone Number is required!"),

  address: z
    .string("Please provide a valid address!")
    .min(3, "Address must be at least 3 characters long")
    .max(100, "Address cannot exceed 100 characters"),
});

export const updateOrderSchema = createOrderSchema
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

export const orderQuerySchema = z.object({
  ...paginationQuery,
  ...searchQuery,
  ...sortQuery,
});

export type TCreateOrder = z.infer<typeof createOrderSchema>;
export type TUpdateOrder = z.infer<typeof updateOrderSchema>;
export type TOrderQuery = z.infer<typeof orderQuerySchema>;
export type TOrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export type TPaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];
