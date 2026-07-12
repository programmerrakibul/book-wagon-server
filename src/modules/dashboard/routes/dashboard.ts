import {
  getAdminDashboardData,
  getLibrarianDashboardData,
  getUserDashboardData,
} from "@/dashboard/controller/dashboard.js";
import { authorize } from "@/middlewares/authorize.js";
import { verifyTokenID } from "@/middlewares/verify-token.js";
import { Router } from "express";

export const dashboardRouter: Router = Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user", authorize("user"), getUserDashboardData);

dashboardRouter.get(
  "/librarian",
  authorize("librarian"),
  getLibrarianDashboardData,
);

dashboardRouter.get("/admin", authorize("admin"), getAdminDashboardData);
