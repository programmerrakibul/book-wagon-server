const express = require("express");
const {
  getUserDashboardData,
  getLibrarianDashboardData,
} = require("../controllers/dashboardController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { verifyLibrarian } = require("../middlewares/verifyLibrarian.js");

const dashboardRouter = express.Router();

dashboardRouter.get("/user/:email", verifyTokenID, getUserDashboardData);

dashboardRouter.get(
  "/librarian/:email",
  verifyTokenID,
  verifyLibrarian,
  getLibrarianDashboardData
);

module.exports = { dashboardRouter };
