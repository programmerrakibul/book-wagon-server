const express = require("express");
const { getInvoices } = require("../controllers/paymentsController.js");
const { verifyTokenID } = require("../middlewares/verifyTokenID.js");
const paymentsRouter = express.Router();

paymentsRouter.use(verifyTokenID);

paymentsRouter.get("/:email", getInvoices);

module.exports = { paymentsRouter };
