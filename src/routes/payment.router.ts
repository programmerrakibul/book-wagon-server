import { getInvoices } from "@/controllers/payments.controller.js";
import { verifyTokenID } from "@/middlewares/verifyTokenID.middleware.js";
import { Router } from "express";

export const paymentsRouter: Router = Router();

paymentsRouter.use(verifyTokenID);

paymentsRouter.get("/", getInvoices);
