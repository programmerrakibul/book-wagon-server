const express = require("express");
const { verifyAdmin } = require("../middlewares/verifyAdmin.js");
const { verifyLibrarian } = require("../middlewares/verifyLibrarian.js");
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

const booksRouter = express.Router();

booksRouter.get("/", getBooks);

booksRouter.get("/categories", getCategories);

booksRouter.get("/:id", validateId, getBookById);

booksRouter.post("/", verifyTokenID, verifyLibrarian, postBook);

booksRouter.patch("/:id", validateId, verifyTokenID, updateBookById);

booksRouter.delete(
  "/:id",
  validateId,
  verifyTokenID,
  verifyAdmin,
  deleteBookById,
);

module.exports = { booksRouter };
