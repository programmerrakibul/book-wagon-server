import controllers from "@/payment/controller/payment.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const paymentsRouter: Router = Router();

paymentsRouter.use(verifyTokenID);

paymentsRouter.get("/", controllers.getInvoices);
