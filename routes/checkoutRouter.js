const express = require("express");
const {
  createCheckout,
  retrieveCheckout,
} = require("../controllers/checkoutController.js");
const checkoutRouter = express.Router();

checkoutRouter.get("/retrieve/:session_id", retrieveCheckout);

checkoutRouter.post("/create", createCheckout);

module.exports = { checkoutRouter };
