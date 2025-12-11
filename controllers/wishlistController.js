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

    res.json({
      success: true,
      message: "Book id added to wishlist",
      ...result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = { addToWishlist };
