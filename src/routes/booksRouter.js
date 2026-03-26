import express from "express";
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

export const booksRouter = express.Router();

booksRouter.get("/", getBooks);

booksRouter.get("/categories", getCategories);

booksRouter.get("/:id", validateId, getBookById);

booksRouter.post("/", verifyTokenID, authorize("librarian"), postBook);

booksRouter.patch("/:id", validateId, verifyTokenID, updateBookById);

booksRouter.delete(
  "/:id",
  validateId,
  verifyTokenID,
  authorize("admin"),
  deleteBookById,
);
