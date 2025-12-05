const { booksCollection } = require("../db.js");

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
      message: "Book added successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { postBook };
