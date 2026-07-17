import { transformToObjectId, validateObjectId } from "@/utils/utils.js";
import z from "zod";

export const addToCartSchema = z.object({
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
    .max(9999, "Quantity cannot exceed 9999")
    .default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce
    .number("Please provide a valid quantity!")
    .min(1, "Quantity must be at least 1")
    .max(9999, "Quantity cannot exceed 9999"),
});
