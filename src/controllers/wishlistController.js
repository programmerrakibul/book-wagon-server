const { ObjectId } = require("mongodb");
const { wishlistCollection, booksCollection } = require("../db.js");

const getWishlistBooks = async (req, res) => {
  const { email } = req.params;

  try {
    const user = await wishlistCollection.findOne({ customerEmail: email });

    const bookIds = (user?.bookIDs || []).map((id) => new ObjectId(id));

    const books = await booksCollection
      .find({ _id: { $in: bookIds } })
      .toArray();

    res.send({
      success: true,
      message: "Wishlist books retrieve successfully",
      books,
    });
  } catch {
    res.status(500).send({ message: "Internal server error" });
  }
};

const addToWishlist = async (req, res) => {
  const { email } = req.params;
  const { bookId } = req.body;
  const today = new Date().toISOString();

  try {
    const result = await wishlistCollection.updateOne(
      { customerEmail: email },
      {
        $addToSet: { bookIDs: bookId },
        $setOnInsert: {
          createdAt: today,
          customerEmail: email,
        },
        $set: { updatedAt: today },
      },
      { upsert: true }
    );

    res.send({
      success: true,
      message: "Book id added to wishlist",
      ...result,
    });
  } catch {
    res.status(500).send({ message: "Internal server error" });
  }
};

const checkInWishlist = async (req, res) => {
  const { email, bookId } = req.params;

  if (!email || !bookId) {
    return res.status(400).send({ message: "Email and Book ID required" });
  }

  const query = {
    customerEmail: email,
    bookIDs: bookId,
  };

  try {
    const user = await wishlistCollection.findOne(query);

    res.send({
      inWishlist: !!user,
    });
  } catch {
    res.status(500).send({ message: "Internal server error" });
  }
};

const removeFromWishlist = async (req, res) => {
  const { email, bookId } = req.params;

  try {
    const result = await wishlistCollection.updateOne(
      { customerEmail: email },
      {
        $pull: { bookIDs: bookId },
        $set: { updatedAt: new Date().toISOString() },
      }
    );

    res.send({
      success: true,
      message: "Book removed from wishlist",
      ...result,
    });
  } catch {
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = {
  getWishlistBooks,
  addToWishlist,
  checkInWishlist,
  removeFromWishlist,
};
