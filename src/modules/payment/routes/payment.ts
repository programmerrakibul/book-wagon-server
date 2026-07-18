import controllers from "@/payment/controller/payment.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

 const router: Router = Router();

router.use(verifyTokenID);

router.get("/", controllers.getInvoices);

export default router;
