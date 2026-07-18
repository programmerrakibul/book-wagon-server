import controllers from "@/favorite/controller/favorite.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

const router = Router();

router.use(verifyTokenID);

router.get("/books", controllers.getFavoriteBooks);

router.get("/check/:id", validateId, controllers.checkInFavorites);

router.post("/:id", validateId, controllers.addToFavorite);

router.delete("/:id", validateId, controllers.removeFromFavorites);

export default router;
