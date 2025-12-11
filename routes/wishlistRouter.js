const express = require("express");
const { addToWishlist } = require("../controllers/wishlistController.js");
const wishlistRouter = express.Router();

wishlistRouter.post("/:email", addToWishlist);

module.exports = { wishlistRouter };
