import controllers from "@/dashboard/controller/dashboard.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { UserRole } from "@/user/validation/user.js";
import { Router } from "express";

export const dashboardRouter: Router = Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get(
  "/user",
  authorize(UserRole.USER),
  controllers.getUserDashboardData,
);

dashboardRouter.get(
  "/librarian",
  authorize(UserRole.LIBRARIAN),
  controllers.getLibrarianDashboardData,
);

dashboardRouter.get(
  "/admin",
  authorize(UserRole.ADMIN),
  controllers.getAdminDashboardData,
);
