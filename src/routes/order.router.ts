import { Router } from "express";
import {
  getAllOrders,
  isOrdered,
  postOrder,
  updateOrder,
} from "../controllers/orders.controller.js";
import { validateData } from "../middlewares/validateData.middleware.js";
import { validateId } from "../middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "../middlewares/verify-token.js";
import {
  orderSchema,
  updateOrderSchema,
} from "../validations/order.validator.js";

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
