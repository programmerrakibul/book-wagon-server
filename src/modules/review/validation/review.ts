import z from "zod";

export const reviewSchema = z.object(
  {
    rating: z
      .number("Please provide a valid rating!")
      .min(1, "Rating must be at least 1!")
      .max(5, "Rating cannot exceed 5!"),

    review: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Review is required!"
            : "Please provide a valid review!";
        },
      })
      .min(3, "Review must be at least 3 characters long")
      .max(1000, "Review cannot exceed 1000 characters"),
  },
  "Review data is required in the request body!",
);

export const reviewQuerySchema = z.object({
  bookId: z
    .string()
    .trim()
    .optional(),
});
