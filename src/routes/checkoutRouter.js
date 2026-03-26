import express from "express";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import {
  createCheckout,
  retrieveCheckout,
} from "../controllers/checkoutController.js";

export const checkoutRouter = express.Router();

checkoutRouter.use(verifyTokenID);

checkoutRouter.get("/retrieve/:session_id", retrieveCheckout);

checkoutRouter.post("/create", createCheckout);
