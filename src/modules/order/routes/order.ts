import { authorize } from "@/middlewares/authorize.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import controllers from "@/order/controller/order.js";
import { UserRole } from "@/user/validation/user.js";
import express from "express";

const router = express.Router();

router.use(
  "/webhook",
  express.raw({ type: "application/json" }),
  controllers.orderWebhook,
);

router.use(verifyTokenID);
router.use(express.json());

router.get("/", controllers.getOrders);

router.get("/invoices", controllers.getInvoices);

router.post("/", controllers.createOrder);

router.post("/checkout/:id", validateId, controllers.createCheckout);

router.get("/:id", validateId, controllers.getOrderById);

router.patch(
  "/:id/status",
  validateId,
  authorize(UserRole.USER, UserRole.ADMIN),
  controllers.updateOrderStatus,
);

router.delete(
  "/:id",
  validateId,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  controllers.deleteOrderById,
);

export default router;
