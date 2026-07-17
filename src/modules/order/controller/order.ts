import services from "@/order/service/order.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getOrders = async (req: Request, res: Response) => {
  const { _id } = req.user;
  const result = await services.getOrders(req.query, _id);

  sendSuccessResponse(res, status.OK, {
    message: "Orders fetched successfully!",
    ...result,
  });
};

const createOrder = async (req: Request, res: Response) => {
  const { _id } = req.user;
  await services.createOrder(req.body, _id);

  sendSuccessResponse(res, status.CREATED, {
    message: "Order created successfully!",
  });
};

const updateOrder = async (req: Request<{ id: string }>, res: Response) => {
  const { id } = req.params;
  await services.updateOrder(id, req.body);

  sendSuccessResponse(res, status.OK, {
    message: "Order data updated successfully!",
  });
};

const controllers = {
  getOrders,
  createOrder,
  updateOrder,
};

export default controllers;
