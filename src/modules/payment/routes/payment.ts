import { verifyTokenID } from "@/middlewares/verify-token.js";
import { getInvoices } from "@/payment/controller/payment.js";
import { Router } from "express";

export const paymentsRouter: Router = Router();

paymentsRouter.use(verifyTokenID);

paymentsRouter.get("/", getInvoices);
