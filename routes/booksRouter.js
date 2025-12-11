const express = require("express");
const {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
} = require("../controllers/booksController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");

const booksRouter = express.Router();

booksRouter.get("/", getBooks);

booksRouter.get("/:id", getBookById);

booksRouter.post("/", verifyTokenID, postBook);

booksRouter.patch("/:id", verifyTokenID, updateBookById);

booksRouter.delete("/:id", verifyTokenID, deleteBookById);

module.exports = { booksRouter };
