import { Router } from "express";
import {
  createCheckout,
  retrieveCheckout,
} from "@/controllers/checkout.controller.js";
import { verifyTokenID } from "@/middlewares/verifyTokenID.middleware.js";

export const checkoutRouter: Router = Router();

checkoutRouter.use(verifyTokenID);

checkoutRouter.get("/retrieve/:id", retrieveCheckout);

checkoutRouter.post("/:orderID", createCheckout);
