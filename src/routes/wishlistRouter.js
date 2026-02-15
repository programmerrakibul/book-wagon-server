const express = require("express");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const {
  addToWishlist,
  checkInWishlist,
  removeFromWishlist,
  getWishlistBooks,
} = require("../controllers/wishlistController.js");
const { idValidator } = require("../middlewares/IdValidator.js");

const wishlistRouter = express.Router();

wishlistRouter.use(verifyTokenID);

wishlistRouter.get("/:email/books", getWishlistBooks);

wishlistRouter.get("/:email/check/:id", idValidator, checkInWishlist);

wishlistRouter.post("/:email/add", addToWishlist);

wishlistRouter.delete("/:email/remove/:id", idValidator, removeFromWishlist);

module.exports = { wishlistRouter };
