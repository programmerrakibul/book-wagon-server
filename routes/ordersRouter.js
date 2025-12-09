const express = require("express");

const {
  postOrder,
  getCustomerOrders,
} = require("../controllers/ordersController.js");

const ordersRouter = express.Router();

ordersRouter.get("/customer/:email", getCustomerOrders);

ordersRouter.post("/", postOrder);

module.exports = { ordersRouter };
