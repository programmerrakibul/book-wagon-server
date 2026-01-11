const express = require("express");
const { getDashboardData } = require("../controllers/dashboardController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");

const dashboardRouter = express.Router();

dashboardRouter.get("/user/:email", verifyTokenID, getDashboardData);

module.exports = { dashboardRouter };
