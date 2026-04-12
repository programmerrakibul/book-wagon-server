import { Router } from "express";
import { authorize } from "@/middlewares/authorize.middleware.js";
import { verifyTokenID } from "@/middlewares/verifyTokenID.middleware.js";
import {
  getAdminDashboardData,
  getLibrarianDashboardData,
  getUserDashboardData,
} from "@/controllers/dashboard.controller.js";

export const dashboardRouter: Router = Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user", authorize("user"), getUserDashboardData);

dashboardRouter.get(
  "/librarian",
  authorize("librarian"),
  getLibrarianDashboardData,
);

dashboardRouter.get("/admin", authorize("admin"), getAdminDashboardData);
