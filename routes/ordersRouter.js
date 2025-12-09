const express = require("express");

const {
  postOrder,
  getCustomerOrders,
  updateOrder,
} = require("../controllers/ordersController.js");

const ordersRouter = express.Router();

ordersRouter.get("/customer/:email", getCustomerOrders);

ordersRouter.post("/", postOrder);

ordersRouter.put("/:orderId", updateOrder);

module.exports = { ordersRouter };
