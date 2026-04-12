import z from "zod";
import { userQuerySchema } from "./user.validator.js";
import type {
  IBookCategory,
  TBookFormat,
  TBookStatus,
} from "@/types/book.interface.js";

export const BookFormat = {
  HARDCOVER: "Hardcover",
  PAPERBACK: "Paperback",
  EBOOK: "eBook",
  AUDIOBOOK: "AudioBook",
} as const;

export const BookCategory = {
  FICTION: "Fiction",
  NON_FICTION: "Non-Fiction",
  SCIENCE: "Science",
  HISTORY: "History",
  BIOGRAPHY: "Biography",
  SELF_HELP: "Self-Help",
  TECHNOLOGY: "Technology",
  BUSINESS: "Business",
  ROMANCE: "Romance",
  MYSTERY: "Mystery",
  FANTASY: "Fantasy",
  HORROR: "Horror",
  OTHER: "Other",
} as const;

export const BookStatus = {
  PUBLISHED: "published",
  UNPUBLISHED: "unpublished",
} as const;

const baseBookSchema = z.object(
  {
    bookName: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Book name is required!"
            : "Please provide a valid book name!";
        },
      })
      .min(3, "Book name must be at least 3 characters long")
      .max(100, "Book name cannot exceed 100 characters"),
    author: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Author name is required!"
            : "Please provide a valid author name!";
        },
      })
      .min(3, "Author name must be at least 3 characters long")
      .max(100, "Author name cannot exceed 100 characters"),
    bookImage: z.url({
      error: (iss) => {
        return iss.input === undefined
          ? "Book image URL is required!"
          : "Please provide a valid book image URL!";
      },
    }),
    category: z.enum(
      Object.values(BookCategory) as [IBookCategory, ...IBookCategory[]],
      {
        error: (iss) => {
          return iss.input === undefined
            ? "Category is required!"
            : `${iss.input} is not a valid category. Please provide a valid category!`;
        },
      },
    ),
    subcategory: z
      .string("Please provide a valid subcategory!")
      .min(3, "Subcategory must be at least 3 characters long")
      .max(100, "Subcategory cannot exceed 100 characters"),
    publicationYear: z.coerce
      .number<number>({
        error: (iss) => {
          return iss.input === undefined || iss.received === "NaN"
            ? "Publication year is required!"
            : "Please provide a valid publication year!";
        },
      })
      .min(1000, "Publication year must be at least 1000")
      .max(
        new Date().getFullYear(),
        "Publication year cannot be in the future",
      ),
    pageCount: z.coerce
      .number<number>({
        error: (iss) => {
          return iss.input === undefined || iss.received === "NaN"
            ? "Page count is required!"
            : "Please provide a valid page count!";
        },
      })
      .min(1, "Page count must be at least 1")
      .max(9999, "Page count cannot exceed 9999"),
    format: z.enum(
      Object.values(BookFormat) as [TBookFormat, ...TBookFormat[]],
      {
        error: (iss) => {
          return iss.input === undefined
            ? "Format is required!"
            : `${iss.input} is not a valid format. Please provide a valid format!`;
        },
      },
    ),
    quantity: z.coerce
      .number<number>({
        error: (iss) => {
          return iss.input === undefined || iss.received === "NaN"
            ? "Quantity is required!"
            : "Please provide a valid quantity!";
        },
      })
      .min(1, "Quantity must be at least 1")
      .max(9999, "Quantity cannot exceed 9999"),
    price: z.coerce
      .number<number>({
        error: (iss) => {
          return iss.input === undefined || iss.received === "NaN"
            ? "Price is required!"
            : "Please provide a valid price!";
        },
      })
      .min(1, "Price must be positive!")
      .max(999999.99, "Price is too high!")
      .transform((value) => Number(value.toFixed(2))),
    status: z.enum(
      Object.values(BookStatus) as [TBookStatus, ...TBookStatus[]],
      {
        error: (iss) => {
          return iss.input === undefined
            ? "Status is required!"
            : `${iss.input} is not a valid status. Please provide a valid status!`;
        },
      },
    ),
    description: z
      .string({
        error: (iss) => {
          return iss.input === undefined
            ? "Description is required!"
            : "Please provide a valid description!";
        },
      })
      .min(3, "Description must be at least 3 characters long")
      .max(1000, "Description cannot exceed 1000 characters"),
  },
  "Book data is required in the request body!",
);

export const createBookSchema = baseBookSchema.extend({
  subcategory: baseBookSchema.shape.subcategory.default("General"),
  quantity: baseBookSchema.shape.quantity.default(1),
  status: baseBookSchema.shape.status.default("unpublished"),
});

export const updateBookSchema = createBookSchema.partial();

export const bookQuerySchema = userQuerySchema.extend({
  category: z
    .string()
    .transform((val) => val.trim())
    .optional(),
  email: z
    .email("Please provide a valid email!")
    .transform((val) => val.trim().toLowerCase())
    .optional(),
});
