const { wishlistCollection } = require("../db");

const postWishedBook = async (req, res) => {
  const book = req.body;
  book.createdAt = new Date().toISOString();

  try {
    const isExist = await wishlistCollection.findOne({ bookId: book.bookId });

    if (!!isExist) {
      return res.send({ message: "Already exist" });
    }

    const result = await wishlistCollection.insertOne(book);

    res.send({
      success: true,
      message: "Book successfully added to wishlist",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { postWishedBook };
