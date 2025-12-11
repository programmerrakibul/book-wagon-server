const express = require("express");
const { postWishedBook } = require("../controllers/wishlistController.js");
const wishlistRouter = express.Router();

wishlistRouter.post("/", postWishedBook);

module.exports = { wishlistRouter };
