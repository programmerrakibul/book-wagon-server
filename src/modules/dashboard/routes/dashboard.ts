import controllers from "@/dashboard/controller/dashboard.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

const router = Router();

router.use(verifyTokenID);

router.get("/user", authorize(UserRole.USER), controllers.getUserDashboardData);

router.get(
  "/librarian",
  authorize(UserRole.LIBRARIAN),
  controllers.getLibrarianDashboardData,
);

router.get(
  "/admin",
  authorize(UserRole.ADMIN),
  controllers.getAdminDashboardData,
);

export default router;
