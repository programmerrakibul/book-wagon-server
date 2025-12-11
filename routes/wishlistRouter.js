const express = require("express");
const {
  addToWishlist,
  checkInWishlist,
  removeFromWishlist,
  getWishlistBooks,
} = require("../controllers/wishlistController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const wishlistRouter = express.Router();

wishlistRouter.use(verifyTokenID);

wishlistRouter.get("/:email/books", getWishlistBooks);

wishlistRouter.get("/:email/check/:bookId", checkInWishlist);

wishlistRouter.post("/:email/add", addToWishlist);

wishlistRouter.delete("/:email/remove/:bookId", removeFromWishlist);

module.exports = { wishlistRouter };
