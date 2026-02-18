const { Order } = require("../models/Order.js");

const getCustomerOrders = async (req, res) => {
  try {
    const email = req.params.email?.trim()?.toLowerCase();

    if (!email) {
      return res
        .status(400)
        .send({ success: false, message: "Email is required" });
    }

    const result = await Order.getOrdersByEmail(email);

    res.send({
      success: true,
      message: "Orders data retrieved successfully",
      total: result.length || 0,
      orders: result,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const getLibrarianOrders = async (req, res) => {
  const email = req.params.email?.trim()?.toLowerCase();

  if (!email) {
    return res
      .status(400)
      .send({ success: false, message: "Email is required" });
  }

  try {
    const result = await Order.getOrdersByEmail(email);

    res.send({
      success: true,
      message: "Orders data retrieved successfully",
      total: result.length || 0,
      orders: result,
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const isOrdered = async (req, res) => {
  const { bookId, customerEmail } = req.params;

  try {
    const result = await Order.isOrdered(bookId, customerEmail);

    res.send(result);
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

const postOrder = async (req, res) => {
  try {
    const orderData = req.body;

    if (Object.keys(orderData || {}).length === 0) {
      return res
        .status(400)
        .send({ success: false, message: "Order data is required" });
    }

    await Order.create(orderData);

    res.status(201).send({
      success: true,
      message: "Order data posted successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal Server Error",
    });
  }
};

const updateOrder = async (req, res) => {
  const updatedData = req.body;
  const { id } = req.params;

  if (Object.keys(updatedData || {}).length === 0) {
    return res
      .status(400)
      .send({ success: false, message: "No data provided for update" });
  }

  try {
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order data not found!",
      });
    }

    await Order.findByIdAndUpdate(id, updatedData, {
      new: true,
    });

    res.send({
      success: true,
      message: "Order data updated successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).send({
      success: false,
      message: err.message || "Internal server error",
    });
  }
};

module.exports = {
  postOrder,
  getCustomerOrders,
  updateOrder,
  getLibrarianOrders,
  isOrdered,
};
