import express from "express";
import {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
} from "../controllers/dashboardController.js";
import { verifyTokenID } from "../middlewares/verifyTokenID.js";
import { authorize } from "../middlewares/authorize.js";

export const dashboardRouter = express.Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user/:email", getUserDashboardData);

dashboardRouter.get(
  "/librarian/:email",
  authorize("librarian"),
  getLibrarianDashboardData,
);

dashboardRouter.get("/admin/:email", authorize("admin"), getAdminDashboardData);
