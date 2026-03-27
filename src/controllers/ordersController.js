import { Order } from "../models/Order.js";

export const getCustomerOrders = async (req, res, next) => {
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
    next(err);
  }
};

export const getLibrarianOrders = async (req, res, next) => {
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
    next(err);
  }
};

export const isOrdered = async (req, res, next) => {
  const { id, customerEmail } = req.params;

  try {
    const result = await Order.isOrdered(id, customerEmail);

    res.send(result);
  } catch (err) {
    next(err);
  }
};

export const postOrder = async (req, res, next) => {
  try {
    await Order.create(req.body);

    res.status(201).send({
      success: true,
      message: "Order data posted successfully",
    });
  } catch (err) {
    next(err);
  }
};

export const updateOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).send({
        success: false,
        message: "Order data not found!",
      });
    }

    await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.send({
      success: true,
      message: "Order data updated successfully",
    });
  } catch (err) {
    next(err);
  }
};
