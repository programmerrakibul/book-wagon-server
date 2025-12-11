const express = require("express");
const {
  addToWishlist,
  checkInWishlist,
  removeFromWishlist,
} = require("../controllers/wishlistController.js");
const wishlistRouter = express.Router();

wishlistRouter.get("/:email/check/:bookId", checkInWishlist);

wishlistRouter.post("/:email/add", addToWishlist);

wishlistRouter.delete("/:email/remove/:bookId", removeFromWishlist);

module.exports = { wishlistRouter };
