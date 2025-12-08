const express = require("express");
const {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
} = require("../controllers/booksController.js");

const booksRouter = express.Router();

booksRouter.get("/", getBooks);

booksRouter.get("/:id", getBookById);

booksRouter.post("/", postBook);

booksRouter.patch("/:id", updateBookById);

booksRouter.delete("/:id", deleteBookById);

module.exports = { booksRouter };
