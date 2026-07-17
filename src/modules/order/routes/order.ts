import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import controllers from "@/order/controller/order.js";
import { Router } from "express";

const router = Router();

router.use(verifyTokenID);

router.get("/", controllers.getOrders);

router.post("/", controllers.createOrder);

router.put("/:id", validateId, controllers.updateOrder);

export default router;
