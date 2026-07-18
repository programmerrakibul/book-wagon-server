import { paginationQuery } from "@/lib/query.js";
import { transformToObjectId, validateObjectId } from "@/utils/utils.js";
import z from "zod";

export const createCommentSchema = z.object({
  comment: z
    .string("Please provide a valid comment!")
    .min(3, "Comment must be at least 3 characters long")
    .max(1000, "Comment cannot exceed 1000 characters"),

  bookId: z
    .string("Please provide a valid book ID!")
    .trim()
    .min(1, "Book ID is required!")
    .refine((val) => {
      return validateObjectId(val);
    }, "Please provide a valid MongoDB ID!")
    .transform((val) => transformToObjectId(val)),
});

export const querySchema = z.object({
  ...paginationQuery,
});

export type TCreateComment = z.infer<typeof createCommentSchema>;
