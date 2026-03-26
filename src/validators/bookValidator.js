import z from "zod";

export const bookSchema = z.object(
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
      [
        "Fiction",
        "Non-Fiction",
        "Science",
        "History",
        "Biography",
        "Self-Help",
        "Technology",
        "Business",
        "Romance",
        "Mystery",
        "Fantasy",
        "Horror",
        "Other",
      ],
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
      .max(100, "Subcategory cannot exceed 100 characters")
      .default("General"),
    publicationYear: z.coerce
      .number({
        error: (iss) => {
          return iss.input === undefined
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
      .number({
        error: (iss) => {
          return iss.input === undefined
            ? "Page count is required!"
            : "Please provide a valid page count!";
        },
      })
      .min(1, "Page count must be at least 1")
      .max(9999, "Page count cannot exceed 9999"),
    format: z.enum(["Hardcover", "Paperback", "eBook", "Audiobook"], {
      error: (iss) => {
        return iss.input === undefined
          ? "Format is required!"
          : `${iss.input} is not a valid format. Please provide a valid format!`;
      },
    }),
    quantity: z.coerce
      .number({
        error: (iss) => {
          return iss.input === undefined
            ? "Quantity is required!"
            : "Please provide a valid quantity!";
        },
      })
      .min(1, "Quantity must be at least 1")
      .max(9999, "Quantity cannot exceed 9999")
      .default(1),
    price: z.coerce
      .number({
        error: (iss) => {
          return iss.input === undefined
            ? "Price is required!"
            : "Please provide a valid price!";
        },
      })
      .min(0, "Price cannot be negative")
      .max(999999.99, "Price is too high")
      .transform((price) => parseFloat(price).toFixed(2)),
    status: z
      .enum(["published", "unpublished"], {
        error: (iss) => {
          return iss.input === undefined
            ? "Status is required!"
            : `${iss.input} is not a valid status. Please provide a valid status!`;
        },
      })
      .default("unpublished"),
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
    librarianEmail: z.email({
      error: (iss) => {
        return iss.input === undefined
          ? "Librarian email is required!"
          : "Please provide a valid librarian email!";
      },
    }),
  },
  "Book data is required in the request body!",
);
