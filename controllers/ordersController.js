const { ordersCollection } = require("../db.js");
const { generateOrderID } = require("../utilities/generateOrderID.js");

const postOrder = async (req, res) => {
  const orderData = req.body;
  const today = new Date().toISOString();
  const orderID = generateOrderID();

  if (typeof orderData !== "object") {
    return res.status(400).send({ message: "Order data is required" });
  }

  orderData.orderID = orderID;
  orderData.createdAt = today;
  orderData.status = "pending";
  orderData.paymentStatus = "unpaid";

  try {
    const result = await ordersCollection.insertOne(orderData);
    res.status(201).send({
      success: true,
      message: "Order data posted successfully",
      ...result,
    });
  } catch {
    return res.status(500).send({ message: "Internal Server Error" });
  }
};

module.exports = { postOrder };
