import { validateData } from "@/middlewares/validateData.middleware.js";
import { validateId } from "@/middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import {
  getAllOrders,
  isOrdered,
  postOrder,
  updateOrder,
} from "@/order/controller/order.js";
import { orderSchema, updateOrderSchema } from "@/order/validation/order.js";
import { Router } from "express";

export const ordersRouter: Router = Router();

ordersRouter.use(verifyTokenID);

ordersRouter.get("/check-ordered/:id", validateId, isOrdered);

ordersRouter.get("/", getAllOrders);

ordersRouter.post("/", validateData(orderSchema), postOrder);

ordersRouter.put(
  "/:id",
  validateId,
  validateData(updateOrderSchema),
  updateOrder,
);
