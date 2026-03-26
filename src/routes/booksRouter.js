const express = require("express");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { validateId } = require("../middlewares/validateId.js");
const {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
  getCategories,
} = require("../controllers/booksController.js");
const { authorize } = require("../middlewares/authorize.js");

const booksRouter = express.Router();

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

module.exports = { booksRouter };
