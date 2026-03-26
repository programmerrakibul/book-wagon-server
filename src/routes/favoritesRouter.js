import express from "express";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import { validateId } from "../middlewares/validateId.js";
import {
  getFavoriteBooks,
  checkInFavorites,
  addToFavorite,
  removeFromFavorites,
} from "../controllers/favoritesController.js";

export const favoritesRouter = express.Router();

favoritesRouter.use(verifyTokenID);

favoritesRouter.get("/:email/books", getFavoriteBooks);

favoritesRouter.get("/:email/check/:id", validateId, checkInFavorites);

favoritesRouter.post("/:email/add", addToFavorite);

favoritesRouter.delete("/:email/remove/:id", validateId, removeFromFavorites);
