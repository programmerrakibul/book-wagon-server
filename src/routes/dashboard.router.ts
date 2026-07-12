import { Router } from "express";
import {
  getAdminDashboardData,
  getLibrarianDashboardData,
  getUserDashboardData,
} from "../controllers/dashboard.controller.js";
import { authorize } from "../middlewares/authorize.js";
import { verifyTokenID } from "../middlewares/verify-token.js";

export const dashboardRouter: Router = Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user", authorize("user"), getUserDashboardData);

dashboardRouter.get(
  "/librarian",
  authorize("librarian"),
  getLibrarianDashboardData,
);

dashboardRouter.get("/admin", authorize("admin"), getAdminDashboardData);
