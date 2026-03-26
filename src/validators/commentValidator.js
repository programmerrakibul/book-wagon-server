import z from "zod";
import { objectIdSchema } from "./objectIdValidator.js";

export const commentSchema = z.object(
  {
    bookId: objectIdSchema,
    customerName: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Customer name is required!"
            : "Please provide a valid name!";
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

    customerImage: z.url({
      error: (iss) => {
        return iss.input === undefined
          ? "Customer image is required!"
          : "Please provide a valid image URL!";
      },
    }),
    comment: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Comment is required!"
            : "Please provide a valid comment!";
        },
      })
      .min(3, "Comment must be at least 3 characters long")
      .max(1000, "Comment cannot exceed 1000 characters"),
  },
  "Comment data is required in the request body!",
);
