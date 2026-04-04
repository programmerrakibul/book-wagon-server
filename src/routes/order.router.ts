import { Router } from "express";
import { validateId } from "../middlewares/validateId.middleware.ts.js";
import { verifyTokenID } from "../middlewares/verifyTokenID.middleware.js";
import {
  postOrder,
  updateOrder,
  isOrdered,
  getAllOrders,
} from "../controllers/orders.controller.js";
import { authorize } from "../middlewares/authorize.middleware.js";
import { validateData } from "../middlewares/validateData.middleware.js";
import {
  orderSchema,
  updateOrderSchema,
} from "../validators/order.validator.js";

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
