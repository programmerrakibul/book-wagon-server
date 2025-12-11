const express = require("express");

const {
  postOrder,
  getCustomerOrders,
  updateOrder,
  getLibrarianOrders,
} = require("../controllers/ordersController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");

const ordersRouter = express.Router();

ordersRouter.use(verifyTokenID)

ordersRouter.get("/customer/:email", getCustomerOrders);

ordersRouter.get("/librarian/:email", getLibrarianOrders);

ordersRouter.post("/", postOrder);

ordersRouter.put("/:orderId", updateOrder);

module.exports = { ordersRouter };
