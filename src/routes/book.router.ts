import { Router } from "express";
import { authorize } from "@/middlewares/authorize.middleware.js";
import { validateData } from "@/middlewares/validateData.middleware.js";
import { validateId } from "@/middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "@/middlewares/verifyTokenID.middleware.js";
import {
  createBookSchema,
  updateBookSchema,
} from "@/validators/book.validator.js";
import {
  deleteBookById,
  getBookById,
  getBooks,
  getCategories,
  postBook,
  updateBookById,
} from "@/controllers/books.controller.js";

export const booksRouter: Router = Router();

booksRouter.get("/", getBooks);

booksRouter.get("/categories", getCategories);

booksRouter.get("/:id", validateId, getBookById);

booksRouter.post(
  "/",
  verifyTokenID,
  authorize("librarian"),
  validateData(createBookSchema),
  postBook,
);

booksRouter.patch(
  "/:id",
  validateId,
  verifyTokenID,
  authorize("admin", "librarian"),
  validateData(updateBookSchema),
  updateBookById,
);

booksRouter.delete(
  "/:id",
  validateId,
  verifyTokenID,
  authorize("admin"),
  deleteBookById,
);
