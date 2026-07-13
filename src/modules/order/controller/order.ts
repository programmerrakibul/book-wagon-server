import type { TOrder } from "@/order/interface/order.js";
import Order from "@/order/model/order.js";
import services from "@/order/service/order.js";
import { type TUpdateOrder } from "@/order/validation/order.js";
import type { TSuccessResponse } from "@/types/index.interface.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "http-errors-enhanced";
import status from "http-status";

const getOrders = async (req: Request, res: Response) => {
  const { _id } = req.user;
  const result = await services.getOrders(req.query, _id);

  sendSuccessResponse(res, status.OK, {
    message: "Orders fetched successfully!",
    ...result,
  });
};

export const isOrdered = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const { email } = req.user;

    // const result = await Order.isOrdered(id, email);

    res.send({
      success: true,
      message: "Order status retrieved successfully",
      // data: result,
    });
  } catch (err) {
    next(err);
  }
};

const createOrder = async (req: Request, res: Response) => {
  const { _id } = req.user;
  await services.createOrder(req.body, _id);

  sendSuccessResponse(res, status.CREATED, {
    message: "Order created successfully!",
  });
};

export const updateOrder = async (
  req: Request<{ id: string }, {}, TUpdateOrder>,
  res: Response<TSuccessResponse>,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;

    const order: TOrder | null = await Order.findById(id);

    if (!order) {
      throw new NotFoundError("Order data not found!");
    }

    await Order.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.send({
      success: true,
      message: "Order data updated successfully!",
    });
  } catch (err) {
    next(err);
  }
};

const controllers = {
  getOrders,
  isOrdered,
  createOrder,
  updateOrder,
};

export default controllers;
