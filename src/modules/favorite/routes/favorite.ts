import controllers from "@/favorite/controller/favorite.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const favoritesRouter: Router = Router();

favoritesRouter.use(verifyTokenID);

favoritesRouter.get("/books", controllers.getFavoriteBooks);

favoritesRouter.get(
  "/is-in-favorites/:id",
  validateId,
  controllers.checkInFavorites,
);

favoritesRouter.post("/:id", validateId, controllers.addToFavorite);

favoritesRouter.delete("/:id", validateId, controllers.removeFromFavorites);
