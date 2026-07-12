import z from "zod";

export const createBookFormatSchema = z.object({
  name: z
    .string("Please provide a valid book format!")
    .trim()
    .min(1, "Book format is required!")
    .max(100, "Book format cannot exceed 100 characters"),

  photoUrl: z
    .url("Please provide a valid URL!")
    .trim()
    .toLowerCase()
    .optional(),
});

export type TCreateBookFormat = z.infer<typeof createBookFormatSchema>;
