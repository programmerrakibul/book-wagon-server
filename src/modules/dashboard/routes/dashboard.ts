import controllers from "@/dashboard/controller/dashboard.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const dashboardRouter: Router = Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user", authorize("user"), controllers.getUserDashboardData);

dashboardRouter.get(
  "/librarian",
  authorize("librarian"),
  controllers.getLibrarianDashboardData,
);

dashboardRouter.get("/admin", authorize("admin"), controllers.getAdminDashboardData);
