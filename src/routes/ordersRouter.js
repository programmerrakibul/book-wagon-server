const express = require("express");
const { idValidator } = require("../middlewares/IdValidator.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const { verifyLibrarian } = require("../middlewares/verifyLibrarian.js");
const {
  postOrder,
  getCustomerOrders,
  updateOrder,
  getLibrarianOrders,
  isOrdered,
} = require("../controllers/ordersController.js");

const ordersRouter = express.Router();

ordersRouter.use(verifyTokenID);

ordersRouter.get("/:bookId/user/:customerEmail", isOrdered);

ordersRouter.get("/customer/:email", getCustomerOrders);

ordersRouter.get("/librarian/:email", verifyLibrarian, getLibrarianOrders);

ordersRouter.post("/", postOrder);

ordersRouter.put("/:id", idValidator, updateOrder);

module.exports = { ordersRouter };
