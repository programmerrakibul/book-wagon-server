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

const getOrderById = async (req: Request<{ id: string }>, res: Response) => {
  const result = await services.getOrderById(req.params.id);

  sendSuccessResponse(res, status.OK, {
    message: "Order data fetched successfully!",
    data: result,
  });
};

const createOrder = async (req: Request, res: Response) => {
  const { _id } = req.user;
  await services.createOrder(req.body, _id);

  sendSuccessResponse(res, status.CREATED, {
    message: "Order created successfully!",
  });
};

const updateOrderStatus = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  await services.updateOrderStatus(id, req.body);

  sendSuccessResponse(res, status.OK, {
    message: "Order data updated successfully!",
  });
};

const deleteOrderById = async (req: Request<{ id: string }>, res: Response) => {
  await services.deleteOrderById(req.params.id);

  sendSuccessResponse(res, status.OK, {
    message: "Order data deleted successfully!",
  });
};

const createCheckout = async (req: Request<{ id: string }>, res: Response) => {
  const result = await services.createCheckout(req.params.id, req.user.email);

  sendSuccessResponse(res, status.OK, {
    message: "Checkout created successfully!",
    data: result,
  });
};

const orderWebhook = async (req: Request, res: Response) => {
  await services.orderWebhook(req.headers["stripe-signature"], req.body);

  sendSuccessResponse(res, status.OK, {
    message: "Order webhook created successfully!",
  });
};

const controllers = {
  getOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  deleteOrderById,
  createCheckout,
  orderWebhook,
};

export default controllers;
