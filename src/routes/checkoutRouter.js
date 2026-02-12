const express = require("express");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const {
  createCheckout,
  retrieveCheckout,
} = require("../controllers/checkoutController.js");

const checkoutRouter = express.Router();

checkoutRouter.use(verifyTokenID);

checkoutRouter.get("/retrieve/:session_id", retrieveCheckout);

checkoutRouter.post("/create", createCheckout);

module.exports = { checkoutRouter };
