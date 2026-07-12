import { validateData } from "@/middlewares/validateData.middleware.js";
import { validateId } from "@/middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import controllers, {
  getAllOrders,
  updateOrder,
} from "@/order/controller/order.js";
import { updateOrderSchema } from "@/order/validation/order.js";
import { Router } from "express";

const router = Router();

router.use(verifyTokenID);

router.get("/", getAllOrders);

router.post("/", controllers.createOrder);

router.put("/:id", validateId, validateData(updateOrderSchema), updateOrder);

export default router;
