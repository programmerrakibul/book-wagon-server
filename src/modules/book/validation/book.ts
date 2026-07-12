import {
  paginationQuery,
  projectionQuery,
  searchQuery,
  sortQuery,
} from "@/lib/query.js";
import {
  double,
  transformToObjectId,
  validateObjectId,
} from "@/utils/utils.js";
import z from "zod";

export const BookStatus = {
  PUBLISHED: "PUBLISHED",
  UNPUBLISHED: "UNPUBLISHED",
} as const;

const baseBookSchema = z.object({
  name: z
    .string("Please provide a valid book name!")
    .trim()
    .min(3, "Book name must be at least 3 characters long")
    .max(100, "Book name cannot exceed 100 characters"),

  description: z
    .string("Please provide a valid description!")
    .trim()
    .min(3, "Description must be at least 3 characters long")
    .max(1000, "Description cannot exceed 1000 characters"),

  author: z
    .string("Please provide a valid author name!")
    .trim()
    .min(3, "Author name must be at least 3 characters long")
    .max(100, "Author name cannot exceed 100 characters"),

  photoUrl: z
    .url("Please provide a valid URL!")
    .trim()
    .lowercase()
    .min(1, "Photo URL is required!"),

  categoryId: z
    .string("Please provide a valid category ID!")
    .trim()
    .min(1, "Category ID is required!")
    .refine((val) => {
      return validateObjectId(val);
    }, "Please provide a valid MongoDB ID!")
    .transform((val) => transformToObjectId(val)),

  subcategoryId: z
    .string("Please provide a valid sub-category ID!")
    .trim()
    .min(1, "Sub-category ID is required!")
    .refine((val) => {
      return validateObjectId(val);
    }, "Please provide a valid MongoDB ID!")
    .transform((val) => transformToObjectId(val)),

  publicationYear: z.coerce
    .number<number>("Please provide a valid publication year!")
    .min(1000, "Publication year must be at least 1000")
    .max(new Date().getFullYear(), "Publication year cannot be in the future"),

  pageCount: z.coerce
    .number<number>("Please provide a valid page count!")
    .min(1, "Page count must be at least 1")
    .max(9999, "Page count cannot exceed 9999"),

  formatId: z
    .string("Please provide a valid format ID!")
    .trim()
    .min(1, "Format ID is required!")
    .refine((val) => {
      return validateObjectId(val);
    }, "Please provide a valid MongoDB ID!")
    .transform((val) => transformToObjectId(val)),

  quantity: z.coerce
    .number<number>("Please provide a valid quantity!")
    .min(1, "Quantity must be at least 1")
    .max(9999, "Quantity cannot exceed 9999"),

  price: z.coerce
    .number<number>("Please provide a valid price!")
    .positive("Price must be positive!")
    .max(999999.99, "Price is too high!")
    .transform((value) => double(value)),

  discount: z.coerce
    .number<number>("Please provide a valid discount!")
    .max(99, "Discount is too high!")
    .optional(),

  status: z.enum(Object.values(BookStatus) as [TBookStatus, ...TBookStatus[]], {
    error: (iss) => {
      return iss.input === undefined
        ? "Status is required!"
        : `${iss.input} is not a valid status. Please provide a valid status!`;
    },
  }),

  weight: z.coerce
    .number("Please provide a valid weight(KG)!")
    .transform((val) => double(val))
    .optional(),
});

export const createBookSchema = baseBookSchema.extend({
  quantity: baseBookSchema.shape.quantity.default(1),
  status: baseBookSchema.shape.status.default(BookStatus.UNPUBLISHED),
});

export const updateBookSchema = createBookSchema
  .extend({
    isActive: z.boolean().optional(),
  })
  .partial();

export const bookQuerySchema = z.object({
  category: z
    .string()
    .transform((val) => val.trim())
    .optional(),

  email: z
    .email("Please provide a valid email!")
    .transform((val) => val.trim().toLowerCase())
    .optional(),

  ...paginationQuery,
  ...sortQuery,
  ...searchQuery,
  ...projectionQuery,
});

export type TCreateBook = z.infer<typeof createBookSchema>;
export type TUpdateBook = z.infer<typeof updateBookSchema>;
export type TBookStatus = (typeof BookStatus)[keyof typeof BookStatus];
export type TBookQuery = z.infer<typeof bookQuerySchema>;
