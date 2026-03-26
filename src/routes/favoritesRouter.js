import express from "express";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import { validateId } from "../middlewares/validateId.js";
import {
  getFavoriteBooks,
  checkInFavorites,
  addToFavorite,
  removeFromFavorites,
} from "../controllers/favoritesController.js";
import { validateData } from "../middlewares/validateData.js";
import { objectIdSchema } from "../validators/objectIdValidator.js";

export const favoritesRouter = express.Router();

favoritesRouter.use(verifyTokenID);

favoritesRouter.get("/:email/books", getFavoriteBooks);

favoritesRouter.get("/:email/check/:id", validateId, checkInFavorites);

favoritesRouter.post(
  "/:email/add",
  validateData(objectIdSchema),
  addToFavorite,
);

favoritesRouter.delete("/:email/remove/:id", validateId, removeFromFavorites);
