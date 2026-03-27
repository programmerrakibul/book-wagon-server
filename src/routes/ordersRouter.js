import express from "express";
import { validateId } from "../middlewares/validateId.js";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import {
  postOrder,
  getCustomerOrders,
  updateOrder,
  getLibrarianOrders,
  isOrdered,
} from "../controllers/ordersController.js";
import { authorize } from "../middlewares/authorize.js";
import { validateData } from "../middlewares/validateData.js";
import {
  orderSchema,
  updateOrderSchema,
} from "../validators/orderValidator.js";

export const ordersRouter = express.Router();

ordersRouter.use(verifyTokenID);

ordersRouter.get("/:id/user/:customerEmail", validateId, isOrdered);

ordersRouter.get("/customer/:email", getCustomerOrders);

ordersRouter.get(
  "/librarian/:email",
  authorize("librarian"),
  getLibrarianOrders,
);

ordersRouter.post("/", validateData(orderSchema), postOrder);

ordersRouter.put(
  "/:id",
  validateId,
  validateData(updateOrderSchema),
  updateOrder,
);
