const express = require("express");
const { validateId } = require("../middlewares/validateId.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const {
  postOrder,
  getCustomerOrders,
  updateOrder,
  getLibrarianOrders,
  isOrdered,
} = require("../controllers/ordersController.js");
const { authorize } = require("../middlewares/authorize.js");

const ordersRouter = express.Router();

ordersRouter.use(verifyTokenID);

ordersRouter.get("/:id/user/:customerEmail", validateId, isOrdered);

ordersRouter.get("/customer/:email", getCustomerOrders);

ordersRouter.get(
  "/librarian/:email",
  authorize("librarian"),
  getLibrarianOrders,
);

ordersRouter.post("/", postOrder);

ordersRouter.put("/:id", validateId, updateOrder);

module.exports = { ordersRouter };
