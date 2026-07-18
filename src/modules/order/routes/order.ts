import { authorize } from "@/middlewares/authorize.js";
import { validateId } from "@/middlewares/validate-id.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import controllers from "@/order/controller/order.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

const router = Router();

router.use(verifyTokenID);

router.get("/", controllers.getOrders);

router.post("/", controllers.createOrder);

router.get("/:id", validateId, controllers.getOrderById);

router.patch(
  "/:id/status",
  validateId,
  authorize(UserRole.ADMIN),
  controllers.updateOrderStatus,
);

router.delete(
  "/:id",
  validateId,
  authorize(UserRole.ADMIN, UserRole.LIBRARIAN),
  controllers.deleteOrderById,
);

export default router;
