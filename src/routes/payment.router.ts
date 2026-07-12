import { Router } from "express";
import { getInvoices } from "../controllers/payments.controller.js";
import { verifyTokenID } from "../middlewares/verify-token.js";

export const paymentsRouter: Router = Router();

paymentsRouter.use(verifyTokenID);

paymentsRouter.get("/", getInvoices);
