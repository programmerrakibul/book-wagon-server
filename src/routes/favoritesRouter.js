const express = require("express");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { idValidator } = require("../middlewares/IdValidator.js");
const {
  getFavoriteBooks,
  checkInFavorites,
  addToFavorite,
  removeFromFavorites,
} = require("../controllers/favoritesController.js");

const favoritesRouter = express.Router();

favoritesRouter.use(verifyTokenID);

favoritesRouter.get("/:email/books", getFavoriteBooks);

favoritesRouter.get("/:email/check/:id", idValidator, checkInFavorites);

favoritesRouter.post("/:email/add", addToFavorite);

favoritesRouter.delete("/:email/remove/:id", idValidator, removeFromFavorites);

module.exports = { favoritesRouter };
