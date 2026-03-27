import { Router } from "express";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import { validateId } from "../middlewares/validateId.js";
import {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  getCategories,
} from "../controllers/booksController.js";
import { authorize } from "../middlewares/authorize.js";
import { validateData } from "../middlewares/validateData.js";
import {
  createBookSchema,
  updateBookSchema,
} from "../validators/bookValidator.js";

export const booksRouter = Router();

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
