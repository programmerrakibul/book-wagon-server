import controllers from "@/checkout/controller/checkout.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const checkoutRouter: Router = Router();

checkoutRouter.use(verifyTokenID);

checkoutRouter.get("/retrieve/:id", controllers.retrieveCheckout);

checkoutRouter.post("/:orderID", controllers.createCheckout);
