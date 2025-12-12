const express = require("express");

const {
  postOrder,
  getCustomerOrders,
  updateOrder,
  getLibrarianOrders,
  isOrdered,
} = require("../controllers/ordersController.js");
const { verifyLibrarian } = require("../middlewares/verifyLibrarian.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");

const ordersRouter = express.Router();

ordersRouter.use(verifyTokenID);

ordersRouter.get("/:bookId/user/:customerEmail", isOrdered);

ordersRouter.get("/customer/:email", getCustomerOrders);

ordersRouter.get("/librarian/:email", verifyLibrarian, getLibrarianOrders);

ordersRouter.post("/", postOrder);

ordersRouter.put("/:orderId", updateOrder);

module.exports = { ordersRouter };
