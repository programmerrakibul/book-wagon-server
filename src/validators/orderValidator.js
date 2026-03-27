import z from "zod";
import { objectIdSchema } from "./objectIdValidator.js";

export const orderSchema = z.object(
  {
    bookId: objectIdSchema,
    librarianEmail: z.email({
      error: (iss) => {
        return iss.input === undefined
          ? "Librarian email is required!"
          : "Please provide a valid email!";
      },
    }),
    customerName: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Customer name is required!"
            : "Please provide a valid customer name!";
        },
      })
      .min(3, "Customer name must be at least 3 characters long")
      .max(50, "Customer name cannot exceed 50 characters"),
    customerEmail: z.email({
      error: (iss) => {
        return iss.input === undefined
          ? "Customer email is required!"
          : "Please provide a valid email!";
      },
    }),
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
      ["pending", "shipped", "delivered", "cancelled"],
      'Status must be one of pending, shipped, delivered, cancelled',
    ),
    paymentStatus: z.enum(
      ["paid", "unpaid", "pending", "failed", "refunded"],
      'Payment status must be one of paid, unpaid, pending, failed, refunded',
    ),
  })
  .partial();
