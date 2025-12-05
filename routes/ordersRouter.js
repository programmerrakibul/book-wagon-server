const express = require("express");

const { postOrder, getOrders } = require("../controllers/ordersController.js");

const ordersRouter = express.Router();

ordersRouter.get("/:email", getOrders);

ordersRouter.post("/", postOrder);

module.exports = { ordersRouter };
