import express from "express";
import { getInvoices } from "../controllers/paymentsController.js";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";

export const paymentsRouter = express.Router();

paymentsRouter.use(verifyTokenID);

paymentsRouter.get("/:email", getInvoices);
