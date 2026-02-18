const express = require("express");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { validateId } = require("../middlewares/validateId.js");
const {
  getFavoriteBooks,
  checkInFavorites,
  addToFavorite,
  removeFromFavorites,
} = require("../controllers/favoritesController.js");

const favoritesRouter = express.Router();

favoritesRouter.use(verifyTokenID);

favoritesRouter.get("/:email/books", getFavoriteBooks);

favoritesRouter.get("/:email/check/:id", validateId, checkInFavorites);

favoritesRouter.post("/:email/add", addToFavorite);

favoritesRouter.delete("/:email/remove/:id", validateId, removeFromFavorites);

module.exports = { favoritesRouter };
