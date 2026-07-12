import { Router } from "express";
import {
  addToFavorite,
  checkInFavorites,
  getFavoriteBooks,
  removeFromFavorites,
} from "../controllers/favorites.controller.js";
import { validateId } from "../middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "../middlewares/verify-token.js";

export const favoritesRouter: Router = Router();

favoritesRouter.use(verifyTokenID);

favoritesRouter.get("/books", getFavoriteBooks);

favoritesRouter.get("/is-in-favorites/:id", validateId, checkInFavorites);

favoritesRouter.post("/:id", validateId, addToFavorite);

favoritesRouter.delete("/:id", validateId, removeFromFavorites);
