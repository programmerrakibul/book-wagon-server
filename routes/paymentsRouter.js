const express = require("express");
const { getInvoices } = require("../controllers/paymentsController.js");
const paymentsRouter = express.Router();

paymentsRouter.get("/:email", getInvoices);

module.exports = { paymentsRouter };
