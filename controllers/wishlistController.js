const { wishlistCollection } = require("../db.js");

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
  } catch (error) {
    console.log(error);

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
  } catch (error) {
    console.log(error);

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

module.exports = { addToWishlist, checkInWishlist, removeFromWishlist };
