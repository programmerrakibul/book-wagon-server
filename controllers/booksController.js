const { ObjectId } = require("mongodb");
const { booksCollection } = require("../db.js");

const getBooks = async (req, res) => {
  const query = {};

  try {
    const books = await booksCollection.find(query).toArray();

    res.send({
      success: true,
      message: "Books data retrieved successfully",
      books,
    });
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const getBookById = async (req, res) => {
  const { id } = req.params;

  if (id.trim().length === 0) {
    return res.status(400).send({ message: "Book ID is required" });
  }

  if (id.length !== 24) {
    return res.status(400).send({ message: "Invalid Book ID" });
  }

  const query = { _id: new ObjectId(id) };

  try {
    const book = await booksCollection.findOne(query);

    if (!book) {
      return res.status(404).send({ message: "Book not found" });
    }

    res.send({
      success: true,
      message: "Book data retrieved successfully",
      book,
    });
  } catch {
    res.status(500).send({ message: "Internal Server Error" });
  }
};

const postBook = async (req, res) => {
  const bookData = req.body;
  const today = new Date().toISOString();
  bookData.createdAt = today;
  bookData.updatedAt = today;
  bookData.status = "pending";
  bookData.paymentStatus = "pending";

  try {
    const result = await booksCollection.insertOne(bookData);

    res.status(201).send({
      success: true,
      message: "Book data posted successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { postBook, getBooks, getBookById };
