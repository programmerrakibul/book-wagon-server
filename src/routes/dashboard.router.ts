import { Router } from "express";
import {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
} from "../controllers/dashboard.controller.js";
import { verifyTokenID } from "../middlewares/verifyTokenID.middleware.js";
import { authorize } from "../middlewares/authorize.middleware.js";

export const dashboardRouter: Router = Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user", authorize("user"), getUserDashboardData);

dashboardRouter.get(
  "/librarian",
  authorize("librarian"),
  getLibrarianDashboardData,
);

dashboardRouter.get("/admin", authorize("admin"), getAdminDashboardData);
