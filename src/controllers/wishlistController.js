const { wishlistCollection } = require("../config/db.js");
const { Book } = require("../models/Book.js");

const getWishlistBooks = async (req, res) => {
  const { email } = req.params;

  if (!email?.trim()) {
    return res.status(400).send({
      success: false,
      message: "Email is required",
    });
  }

  try {
    const user = await wishlistCollection.findOne({ customerEmail: email });

    const bookIds = (user?.bookIDs || []).map((id) =>
      mongoose.Types.ObjectId(id),
    );

    const books = await Book.find({ _id: { $in: bookIds } });

    res.send({
      success: true,
      message: "Wishlist books data retrieve successfully",
      books,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
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
      { upsert: true },
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
  const { email, id } = req.params;

  if (!email?.trim()) {
    return res
      .status(400)
      .send({ success: false, message: "Email is required" });
  }

  const query = {
    customerEmail: email,
    bookIDs: id,
  };

  try {
    const user = await wishlistCollection.findOne(query);

    res.send({
      inWishlist: !!user,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  const { email, id } = req.params;

  if (!email?.trim()) {
    return res
      .status(400)
      .send({ success: false, message: "Email is required" });
  }

  try {
    const result = await wishlistCollection.updateOne(
      { customerEmail: email },
      {
        $pull: { bookIDs: id },
        $set: { updatedAt: new Date().toISOString() },
      },
    );

    res.send({
      success: true,
      message: "Book removed from wishlist",
      ...result,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

module.exports = {
  getWishlistBooks,
  addToWishlist,
  checkInWishlist,
  removeFromWishlist,
};
