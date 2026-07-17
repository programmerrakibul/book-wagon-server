import controllers from "@/cart/controller/cart.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const cartRouter: Router = Router();

cartRouter.use(verifyTokenID);

cartRouter.get("/", controllers.getCart);

cartRouter.post("/", controllers.addToCart);

cartRouter.put("/:id", validateId, controllers.updateCartItem);

cartRouter.delete("/:id", validateId, controllers.removeFromCart);

cartRouter.delete("/", controllers.clearCart);
