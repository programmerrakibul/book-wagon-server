const express = require("express");

const { postOrder } = require("../controllers/ordersController.js");

const ordersRouter = express.Router();

ordersRouter.post("/", postOrder);

module.exports = { ordersRouter };
