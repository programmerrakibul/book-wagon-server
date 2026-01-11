const express = require("express");
const {
  getUserDashboardData,
  getLibrarianDashboardData,
  getAdminDashboardData,
} = require("../controllers/dashboardController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { verifyLibrarian } = require("../middlewares/verifyLibrarian.js");
const { verifyAdmin } = require("../middlewares/verifyAdmin.js");

const dashboardRouter = express.Router();

dashboardRouter.use(verifyTokenID);

dashboardRouter.get("/user/:email", getUserDashboardData);

dashboardRouter.get(
  "/librarian/:email",
  verifyLibrarian,
  getLibrarianDashboardData
);

dashboardRouter.get("/admin/:email", verifyAdmin, getAdminDashboardData);

module.exports = { dashboardRouter };
