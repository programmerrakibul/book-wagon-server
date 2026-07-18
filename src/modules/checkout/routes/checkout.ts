import controllers from "@/checkout/controller/checkout.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const checkoutRouter: Router = Router();

checkoutRouter.use(verifyTokenID);

checkoutRouter.get("/retrieve/:id", controllers.retrieveCheckout);

checkoutRouter.post("/:id", validateId, controllers.createCheckout);
