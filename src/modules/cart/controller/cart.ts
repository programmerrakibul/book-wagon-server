import services from "@/cart/service/cart.js";
import { sendSuccessResponse } from "@/utils/sendResponse.js";
import type { Request, Response } from "express";
import status from "http-status";

const getCart = async (req: Request, res: Response) => {
  const { _id } = req.user;
  const result = await services.getCart(_id);

  sendSuccessResponse(res, status.OK, {
    message: "Cart data retrieved successfully!",
    data: result,
  });
};

const addToCart = async (req: Request, res: Response) => {
  const { _id } = req.user;
  await services.addToCart(_id, req.body);

  sendSuccessResponse(res, status.CREATED, {
    message: "Book added to cart successfully!",
  });
};

const updateCartItem = async (req: Request<{ id: string }>, res: Response) => {
  const { _id } = req.user;
  const { id: bookId } = req.params;

  await services.updateCartItem(_id, bookId, req.body);

  sendSuccessResponse(res, status.OK, {
    message: "Cart item updated successfully!",
  });
};

const removeFromCart = async (req: Request<{ id: string }>, res: Response) => {
  const { _id } = req.user;
  const { id: bookId } = req.params;

  await services.removeFromCart(_id, bookId);

  sendSuccessResponse(res, status.OK, {
    message: "Book removed from cart successfully!",
  });
};

const clearCart = async (req: Request, res: Response) => {
  const { _id } = req.user;
  await services.clearCart(_id);

  sendSuccessResponse(res, status.OK, {
    message: "Cart cleared successfully!",
  });
};

const controllers = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};

export default controllers;
