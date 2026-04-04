import z from "zod";

export const commentSchema = z.object(
  {
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
