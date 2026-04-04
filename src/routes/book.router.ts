import { Router } from "express";
import { verifyTokenID } from "../middlewares/verifyTokenID.middleware.js";
import { validateId } from "../middlewares/validateId.middleware.ts.js";
import {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  getCategories,
} from "../controllers/books.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateData } from "../middlewares/validateData.middleware.js";
import {
  createBookSchema,
  updateBookSchema,
} from "../validators/book.validator.js";

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
