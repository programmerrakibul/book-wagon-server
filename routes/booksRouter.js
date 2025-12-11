const express = require("express");
const {
  postBook,
  getBooks,
  getBookById,
  updateBookById,
  deleteBookById,
} = require("../controllers/booksController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { verifyAdmin } = require("../middlewares/verifyAdmin.js");
const { verifyLibrarian } = require("../middlewares/verifyLibrarian.js");

const booksRouter = express.Router();

booksRouter.get("/", getBooks);

booksRouter.get("/:id", getBookById);

booksRouter.post("/", verifyTokenID, verifyLibrarian, postBook);

booksRouter.patch("/:id", verifyTokenID, updateBookById);

booksRouter.delete("/:id", verifyTokenID, verifyAdmin, deleteBookById);

module.exports = { booksRouter };
