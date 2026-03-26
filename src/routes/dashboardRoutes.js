const express = require("express");
const {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
} = require("../controllers/dashboardController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { authorize } = require("../middlewares/authorize.js");

const dashboardRouter = express.Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user/:email", getUserDashboardData);

dashboardRouter.get(
  "/librarian/:email",
  authorize("librarian"),
  getLibrarianDashboardData,
);

dashboardRouter.get("/admin/:email", authorize("admin"), getAdminDashboardData);

module.exports = { dashboardRouter };
